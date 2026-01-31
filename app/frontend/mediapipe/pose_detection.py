import cv2
import time
import mediapipe as mp
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import PoseLandmarker, PoseLandmarkerOptions, PoseLandmarkerResult, RunningMode

MODEL_PATH = "app/shared/models/pose_landmarker_lite.task"

POSE_CONNECTIONS = [
    (0,11),(0,12),(11,12),(11,13),(13,15),(12,14),(14,16),
    (15,17),(16,18),(17,19),(18,20),
    (23,25),(24,26),(25,27),(26,28),(27,29),(28,30),
    (11,23),(12,24)
]

# OpenCV webcam
cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
if not cap.isOpened():
    print("ERROR: Could not open webcam")
    exit()

frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

# PoseLandmarker synchronous (IMAGE mode works for real-time frames)
options = PoseLandmarkerOptions(
    base_options=BaseOptions(model_asset_path=MODEL_PATH),
    running_mode=RunningMode.IMAGE  # synchronous mode
)

with PoseLandmarker.create_from_options(options) as landmarker:
    while True:
        ret, frame = cap.read()
        if not ret:
            continue

        frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)

        # Synchronous detection
        result = landmarker.detect(mp_image)

        # Draw landmarks and skeleton lines
        if result.pose_landmarks:
            landmarks = result.pose_landmarks[0]
            for lm in landmarks:
                x = int(lm.x * frame_width)
                y = int(lm.y * frame_height)
                cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)
            for start_idx, end_idx in POSE_CONNECTIONS:
                x1, y1 = int(landmarks[start_idx].x * frame_width), int(landmarks[start_idx].y * frame_height)
                x2, y2 = int(landmarks[end_idx].x * frame_width), int(landmarks[end_idx].y * frame_height)
                cv2.line(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)

        cv2.imshow("Pose Skeleton", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

cap.release()
cv2.destroyAllWindows()