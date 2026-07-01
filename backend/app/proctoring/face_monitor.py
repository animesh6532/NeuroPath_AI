import cv2
import numpy as np
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(cascade_path)

eye_cascade_path = cv2.data.haarcascades + "haarcascade_eye.xml"
eye_cascade = cv2.CascadeClassifier(eye_cascade_path)

# Track consecutive frames
state = {
    "no_face_count": 0,
    "multi_face_count": 0,
    "look_away_count": 0
}

def analyze_frame(frame_bytes: bytes):
    np_arr = np.frombuffer(frame_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if frame is None:
        return {
            "face_detected": False,
            "multiple_faces": False,
            "warning": "Invalid frame received"
        }

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    # Use more tolerant parameters
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(60, 60)
    )

    num_faces = len(faces)
    logger.info(f"Proctoring: Detected {num_faces} face(s).")

    # 1. No face logic
    if num_faces == 0:
        state["no_face_count"] += 1
        state["multi_face_count"] = 0
        state["look_away_count"] = 0
        if state["no_face_count"] >= 5:
            return {
                "face_detected": False,
                "multiple_faces": False,
                "warning": "No face detected. Please stay visible."
            }
        return {"face_detected": False, "multiple_faces": False, "warning": None}

    # 2. Multiple persons logic
    if num_faces > 1:
        state["multi_face_count"] += 1
        state["no_face_count"] = 0
        state["look_away_count"] = 0
        if state["multi_face_count"] >= 5:
            return {
                "face_detected": True,
                "multiple_faces": True,
                "warning": "Multiple persons detected. Ensure you are alone."
            }
        return {"face_detected": True, "multiple_faces": True, "warning": None}

    # 3. Exactly 1 face (Valid)
    # Check if face is too small / partially visible
    (x, y, w, h) = faces[0]
    face_area = w * h
    frame_area = frame.shape[0] * frame.shape[1]

    if face_area < frame_area * 0.02:  # Lowered threshold to 2% to be less sensitive
        state["no_face_count"] += 1
        state["look_away_count"] = 0
        if state["no_face_count"] >= 5:
            return {
                "face_detected": False,
                "multiple_faces": False,
                "warning": "Face too far or not properly visible. Please move closer."
            }
        return {"face_detected": False, "multiple_faces": False, "warning": None}

    # Detect eyes within the face ROI to trace looking away
    roi_gray = gray[y:y+h, x:x+w]
    eyes = eye_cascade.detectMultiScale(roi_gray, scaleFactor=1.1, minNeighbors=3, minSize=(10, 10))
    
    if len(eyes) == 0:
        state["look_away_count"] += 1
        if state["look_away_count"] >= 5:
            return {
                "face_detected": True,
                "multiple_faces": False,
                "warning": "Looking away from screen detected. Please focus on the interview."
            }
        return {"face_detected": True, "multiple_faces": False, "warning": None}

    # Reset states on a fully valid, perfectly detected single face frame with eyes visible
    state["no_face_count"] = 0
    state["multi_face_count"] = 0
    state["look_away_count"] = 0

    return {
        "face_detected": True,
        "multiple_faces": False,
        "warning": None
    }

