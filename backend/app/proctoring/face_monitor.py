import cv2
import numpy as np
import logging
import os
import urllib.request
import time
from backend.app.config.config import settings

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Model download URLs and path
YUNET_MODEL_URL = "https://github.com/opencv/opencv_zoo/raw/main/models/face_detection_yunet/face_detection_yunet_2023mar.onnx"
YUNET_MODEL_FILENAME = "face_detection_yunet_2023mar.onnx"

# Ensure the model directory exists
os.makedirs(settings.MODEL_PATH, exist_ok=True)
YUNET_MODEL_PATH = os.path.join(settings.MODEL_PATH, YUNET_MODEL_FILENAME)

# Global FaceDetectorYN instance
_detector = None

def get_face_detector(width=320, height=240):
    global _detector
    if not os.path.exists(YUNET_MODEL_PATH):
        try:
            logger.info("Downloading YuNet face detector model...")
            urllib.request.urlretrieve(YUNET_MODEL_URL, YUNET_MODEL_PATH)
            logger.info("YuNet model downloaded successfully.")
        except Exception as e:
            logger.error(f"Error downloading YuNet model: {e}")
            return None

    if _detector is None:
        try:
            _detector = cv2.FaceDetectorYN.create(
                model=YUNET_MODEL_PATH,
                config="",
                input_size=(width, height),
                score_threshold=settings.PROCTORING_DETECTION_THRESHOLD,
                nms_threshold=0.3,
                top_k=5000
            )
            logger.info("YuNet face detector initialized successfully.")
        except Exception as e:
            logger.error(f"Error initializing YuNet face detector: {e}")
            return None
    else:
        _detector.setInputSize((width, height))
        _detector.setScoreThreshold(settings.PROCTORING_DETECTION_THRESHOLD)
    return _detector

# Session-specific tracking cache to maintain identities across frames
# Maps session_id -> {"last_bbox": (x, y, w, h), "last_landmarks": [...], "last_update": float}
session_trackers = {}

def prune_session_trackers():
    """Prunes trackers that have been inactive for more than 30 minutes."""
    now = time.time()
    expired = [sid for sid, tracker in session_trackers.items() if now - tracker["last_update"] > 1800]
    for sid in expired:
        del session_trackers[sid]

# Keep the old global state for legacy backward compatibility
state = {
    "no_face_count": 0,
    "multi_face_count": 0,
    "look_away_count": 0
}

# Legacy Haar Cascades fallback
cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(cascade_path)
eye_cascade_path = cv2.data.haarcascades + "haarcascade_eye.xml"
eye_cascade = cv2.CascadeClassifier(eye_cascade_path)

def analyze_frame_haar_fallback(frame, gray):
    """Haar Cascade fallback analysis if YuNet fails to initialize."""
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(60, 60))
    face_count = len(faces)
    face_detected = face_count > 0
    multiple_faces = face_count > 1
    
    face_centered = False
    good_lighting = False
    mean_brightness = 0.0
    face_size = 0.0
    look_away = False
    warning_msg = None
    
    if face_count == 0:
        mean_brightness = float(np.mean(gray))
        good_lighting = settings.PROCTORING_LIGHTING_MIN <= mean_brightness <= settings.PROCTORING_LIGHTING_MAX
    elif face_count > 1:
        mean_brightness = float(np.mean(gray))
        good_lighting = settings.PROCTORING_LIGHTING_MIN <= mean_brightness <= settings.PROCTORING_LIGHTING_MAX
    else:
        (x, y, w, h) = faces[0]
        face_area = w * h
        frame_area = frame.shape[0] * frame.shape[1]
        face_size = float(face_area / frame_area)
        
        face_cx = x + w / 2
        frame_cx = frame.shape[1] / 2
        face_centered = abs(face_cx - frame_cx) <= (frame.shape[1] * 0.18)
        
        face_roi = gray[y:y+h, x:x+w]
        mean_brightness = float(np.mean(face_roi))
        good_lighting = settings.PROCTORING_LIGHTING_MIN <= mean_brightness <= settings.PROCTORING_LIGHTING_MAX
        
        eyes = eye_cascade.detectMultiScale(face_roi, scaleFactor=1.1, minNeighbors=3, minSize=(10, 10))
        look_away = len(eyes) == 0

    return {
        "face_detected": face_detected,
        "face_count": face_count,
        "multiple_faces": multiple_faces,
        "face_confidence": 0.5 if face_detected else 0.0,
        "tracking_confidence": 0.5 if face_detected else 0.0,
        "landmark_confidence": 0.5 if face_detected else 0.0,
        "face_centered": face_centered,
        "good_lighting": good_lighting,
        "brightness": mean_brightness,
        "face_size": face_size,
        "look_away": look_away,
        "yaw": 0.0,
        "pitch": 0.0,
        "roll": 0.0,
        "warning": "Haar Fallback: Eyes lookup missing" if look_away else None
    }

def calculate_iou(box1, box2):
    """Calculates Intersection over Union (IoU) between two bounding boxes."""
    x1, y1, w1, h1 = box1
    x2, y2, w2, h2 = box2
    
    xi1 = max(x1, x2)
    yi1 = max(y1, y2)
    xi2 = min(x1 + w1, x2 + w2)
    yi2 = min(y1 + h1, y2 + h2)
    
    inter_area = max(0, xi2 - xi1) * max(0, yi2 - yi1)
    box1_area = w1 * h1
    box2_area = w2 * h2
    union_area = box1_area + box2_area - inter_area
    
    return inter_area / union_area if union_area > 0 else 0.0

def recursive_normalize(val):
    """Recursively normalizes any NumPy types in nested structures to native Python types."""
    if isinstance(val, dict):
        return {recursive_normalize(k): recursive_normalize(v) for k, v in val.items()}
    elif isinstance(val, (list, tuple, set)):
        return [recursive_normalize(item) for item in val]
    elif isinstance(val, np.bool_):
        return bool(val)
    elif isinstance(val, np.integer):
        return int(val)
    elif isinstance(val, np.floating):
        return float(val)
    elif isinstance(val, np.ndarray):
        return [recursive_normalize(x) for x in val.tolist()]
    elif hasattr(val, "item") and callable(val.item):
        try:
            return val.item()
        except Exception:
            pass
    return val

def analyze_frame(frame_bytes: bytes, session_id: str = None):
    # Prune trackers occasionally
    if len(session_trackers) > 500:
        prune_session_trackers()

    np_arr = np.frombuffer(frame_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if frame is None:
        return recursive_normalize({
            "face_detected": False,
            "face_count": 0,
            "multiple_faces": False,
            "face_confidence": 0.0,
            "tracking_confidence": 0.0,
            "landmark_confidence": 0.0,
            "face_centered": False,
            "good_lighting": False,
            "brightness": 0.0,
            "face_size": 0.0,
            "look_away": False,
            "yaw": 0.0,
            "pitch": 0.0,
            "roll": 0.0,
            "warning": "Invalid frame received"
        })

    h, w = frame.shape[:2]
    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)

    # Attempt to load and execute YuNet
    det = get_face_detector(w, h)
    if det is None:
        logger.warning("YuNet not available. Falling back to legacy Haar Cascades.")
        return recursive_normalize(analyze_frame_haar_fallback(frame, gray))

    try:
        retval, faces = det.detect(frame)
    except Exception as e:
        logger.error(f"YuNet detection failed: {e}. Falling back to Haar Cascades.")
        return recursive_normalize(analyze_frame_haar_fallback(frame, gray))

    face_count = int(faces.shape[0]) if faces is not None else 0
    face_detected = face_count > 0
    multiple_faces = face_count > 1

    # Default parameters
    face_confidence = 0.0
    tracking_confidence = 1.0 # default to high if starting new
    landmark_confidence = 0.0
    face_centered = False
    good_lighting = False
    mean_brightness = 0.0
    face_size = 0.0
    look_away = False
    yaw = 0.0
    pitch = 0.0
    roll = 0.0
    warning_msg = None

    if not face_detected:
        # Calculate lighting on entire frame when no face is found
        mean_brightness = float(np.mean(gray))
        good_lighting = settings.PROCTORING_LIGHTING_MIN <= mean_brightness <= settings.PROCTORING_LIGHTING_MAX
        tracking_confidence = 0.0
        
        # Update legacy global state
        state["no_face_count"] += 1
        state["multi_face_count"] = 0
        state["look_away_count"] = 0
        
        # Clear tracker for this session if face is completely lost
        if session_id and session_id in session_trackers:
            session_trackers[session_id]["last_update"] = time.time()
            
    else:
        # Reset legacy global state
        state["no_face_count"] = 0
        if multiple_faces:
            state["multi_face_count"] += 1
            state["look_away_count"] = 0
        else:
            state["multi_face_count"] = 0

        # Choose the primary face (the largest one by area)
        primary_idx = 0
        max_area = 0
        for idx in range(face_count):
            _, _, fw, fh = faces[idx][0:4].astype(int)
            area = fw * fh
            if area > max_area:
                max_area = area
                primary_idx = idx

        face_data = faces[primary_idx]
        fx, fy, fw, fh = face_data[0:4].astype(int)
        landmarks = face_data[4:14].reshape(5, 2)
        face_confidence = float(face_data[14])

        # Bounding box dimensions & area ratio
        face_area = fw * fh
        frame_area = w * h
        face_size = float(face_area / frame_area)

        # Centering check: distance from face center to frame center
        face_cx = fx + fw / 2.0
        frame_cx = w / 2.0
        face_centered = abs(face_cx - frame_cx) <= (w * 0.18)

        # Lighting check on face bounding box
        # Clamp coordinates to frame boundaries
        fx_c = max(0, fx)
        fy_c = max(0, fy)
        fw_c = min(w - fx_c, fw)
        fh_c = min(h - fy_c, fh)
        
        if fw_c > 0 and fh_c > 0:
            face_roi = gray[fy_c:fy_c+fh_c, fx_c:fx_c+fw_c]
            mean_brightness = float(np.mean(face_roi))
        else:
            mean_brightness = float(np.mean(gray))
            
        good_lighting = settings.PROCTORING_LIGHTING_MIN <= mean_brightness <= settings.PROCTORING_LIGHTING_MAX

        # Compute Landmark Confidence
        # Proportions: eye_dist / face_width (~0.35), mouth_width / face_width (~0.38)
        left_eye = landmarks[0]
        right_eye = landmarks[1]
        nose = landmarks[2]
        left_mouth = landmarks[3]
        right_mouth = landmarks[4]

        eye_dist = float(np.linalg.norm(right_eye - left_eye))
        mouth_dist = float(np.linalg.norm(right_mouth - left_mouth))
        
        eye_ratio = eye_dist / fw if fw > 0 else 0.0
        mouth_ratio = mouth_dist / fw if fw > 0 else 0.0
        
        landmark_confidence = 1.0 - min(1.0, 2.2 * (abs(eye_ratio - 0.35) + abs(mouth_ratio - 0.38)))
        landmark_confidence = max(0.0, float(landmark_confidence))

        # Compute Head Rotation Angles (Yaw, Pitch, Roll)
        # Yaw: difference in horizontal distance from nose to eyes
        dx_l = abs(nose[0] - left_eye[0])
        dx_r = abs(nose[0] - right_eye[0])
        if dx_l + dx_r > 0:
            yaw_ratio = (dx_l - dx_r) / (dx_l + dx_r)
        else:
            yaw_ratio = 0.0
        yaw = float(yaw_ratio * 90.0) # approx mapping to degrees (-90 to 90)

        # Pitch: vertical positioning of nose between eyes and mouth
        eye_y = (left_eye[1] + right_eye[1]) / 2.0
        mouth_y = (left_mouth[1] + right_mouth[1]) / 2.0
        dy_eye = abs(nose[1] - eye_y)
        dy_mouth = abs(mouth_y - nose[1])
        if dy_eye + dy_mouth > 0:
            pitch_ratio = (dy_eye - dy_mouth) / (dy_eye + dy_mouth)
        else:
            pitch_ratio = 0.0
        pitch = float(pitch_ratio * 90.0) # approx mapping to degrees

        # Roll: rotation angle in the 2D image plane between the eyes
        dy_eyes = right_eye[1] - left_eye[1]
        dx_eyes = right_eye[0] - left_eye[0]
        roll = float(np.arctan2(dy_eyes, dx_eyes) * 180.0 / np.pi)

        # Gaze tracking decision based on head rotation thresholds
        if abs(yaw) > 28.0 or abs(pitch) > 22.0 or abs(roll) > 22.0:
            look_away = True
            state["look_away_count"] += 1
        else:
            look_away = False
            state["look_away_count"] = 0

        # Compute Tracking Confidence (comparing with previous frame)
        curr_box = (fx, fy, fw, fh)
        if session_id:
            if session_id in session_trackers:
                prev_tracker = session_trackers[session_id]
                prev_box = prev_tracker["last_bbox"]
                
                # Tracking confidence = IoU between consecutive frames
                tracking_confidence = float(calculate_iou(prev_box, curr_box))
                
                # Apply smoothing to landmarks/bbox if tracking confidence is high
                if tracking_confidence > 0.4:
                    # Smoothing using exponential moving average (alpha = 0.6)
                    alpha = 0.6
                    fx_smooth = int(alpha * fx + (1 - alpha) * prev_box[0])
                    fy_smooth = int(alpha * fy + (1 - alpha) * prev_box[1])
                    fw_smooth = int(alpha * fw + (1 - alpha) * prev_box[2])
                    fh_smooth = int(alpha * fh + (1 - alpha) * prev_box[3])
                    curr_box = (fx_smooth, fy_smooth, fw_smooth, fh_smooth)
            
            # Save current state to session cache
            session_trackers[session_id] = {
                "last_bbox": curr_box,
                "last_landmarks": landmarks.tolist(),
                "last_update": time.time()
            }
        else:
            tracking_confidence = 1.0 # First frame/no session: start high

    return recursive_normalize({
        "face_detected": face_detected,
        "face_count": face_count,
        "multiple_faces": multiple_faces,
        "face_confidence": round(face_confidence, 3),
        "tracking_confidence": round(tracking_confidence, 3),
        "landmark_confidence": round(landmark_confidence, 3),
        "face_centered": face_centered,
        "good_lighting": good_lighting,
        "brightness": round(mean_brightness, 1),
        "face_size": round(face_size, 3),
        "look_away": look_away,
        "yaw": round(yaw, 1),
        "pitch": round(pitch, 1),
        "roll": round(roll, 1),
        "warning": warning_msg
    })
