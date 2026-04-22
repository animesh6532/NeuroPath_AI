import cv2
import numpy as np

cascade_path = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
face_cascade = cv2.CascadeClassifier(cascade_path)


def analyze_frame(frame_bytes: bytes):
    np_arr = np.frombuffer(frame_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if frame is None:
        return {
            "violation": True,
            "reason": "Invalid frame received"
        }

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    gray = cv2.equalizeHist(gray)

    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.05,
        minNeighbors=3,
        minSize=(50, 50)
    )

    # ❌ No face
    if len(faces) == 0:
        return {
            "violation": True,
            "reason": "No face detected"
        }

    # ❌ Multiple persons
    if len(faces) > 1:
        return {
            "violation": True,
            "reason": "Multiple persons detected"
        }

    # ❌ Face too small / too far / partially visible
    (x, y, w, h) = faces[0]
    face_area = w * h
    frame_area = frame.shape[0] * frame.shape[1]

    if face_area < frame_area * 0.03:
        return {
            "violation": True,
            "reason": "Face too far or not properly visible"
        }

    # ❌ Face moved too much left/right
    face_center_x = x + w // 2
    frame_center_x = frame.shape[1] // 2

    if abs(face_center_x - frame_center_x) > frame.shape[1] * 0.30:
        return {
            "violation": True,
            "reason": "Face moved out of frame"
        }

    return {
        "violation": False,
        "reason": "Face detected properly"
    }