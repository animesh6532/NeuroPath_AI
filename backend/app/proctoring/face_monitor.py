import cv2
import numpy as np

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

previous_face_center = None

def analyze_frame_bytes(image_bytes):
    global previous_face_center

    np_arr = np.frombuffer(image_bytes, np.uint8)
    frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

    if frame is None:
        return {"status": "error", "message": "Invalid frame"}

    gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

    result = {
        "status": "ok",
        "faces_detected": len(faces),
        "violation": False,
        "reason": None
    }

    if len(faces) == 0:
        result["violation"] = True
        result["reason"] = "No face detected"
        return result

    if len(faces) > 1:
        result["violation"] = True
        result["reason"] = "Multiple faces detected"
        return result

    # Single face movement tracking
    (x, y, w, h) = faces[0]
    current_center = (x + w // 2, y + h // 2)

    if previous_face_center is not None:
        movement = abs(current_center[0] - previous_face_center[0]) + abs(current_center[1] - previous_face_center[1])

        if movement > 80:
            result["violation"] = True
            result["reason"] = "Excessive movement detected"

    previous_face_center = current_center
    return result