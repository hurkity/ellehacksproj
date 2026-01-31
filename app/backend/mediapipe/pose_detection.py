import cv2
import time
import mediapipe as mp
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import PoseLandmarker, PoseLandmarkerOptions, PoseLandmarkerResult, RunningMode

# MODEL_PATH = "..\..\shared\models\pose_landmarker_lite.task"
MODEL_PATH = "shared/models/pose_landmarker_lite.task"

POSE_CONNECTIONS = [
    (0,11),(0,12),(11,12),(11,13),(13,15),(12,14),(14,16),
    (15,17),(16,18),(17,19),(18,20),
    (23,25),(24,26),(25,27),(26,28),(27,29),(28,30),
    (11,23),(12,24)
]


def run_pose_detection(process_frame_callback=None):
    camera_index = 1
    print(f"[PoseDetection] Using camera index: {camera_index}")
    cap = cv2.VideoCapture(camera_index, cv2.CAP_DSHOW)
    if not cap.isOpened():
        print("ERROR: Could not open webcam")
        return

    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    print(f"[PoseDetection] Frame size: {frame_width}x{frame_height}")
    print(f"[PoseDetection] Model path: {MODEL_PATH}")

    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=RunningMode.IMAGE  # synchronous mode
    )

    with PoseLandmarker.create_from_options(options) as landmarker:
        while True:
            ret, frame = cap.read()
            if not ret:
                print("[PoseDetection] Failed to read frame from camera")
                continue

            # Save the current frame to disk for debugging
            import datetime
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S_%f")
            debug_frame_path = f"debug_backend_frame_{timestamp}.jpg"
            cv2.imwrite(debug_frame_path, frame)
            print(f"[PoseDetection] Saved debug frame to {debug_frame_path}")

            frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
            result = landmarker.detect(mp_image)

            if process_frame_callback:
                # Pass normalized landmarks to callback
                pose_data = {"landmarks": []}
                if result.pose_landmarks:
                    landmarks = result.pose_landmarks[0]
                    print(f"[PoseDetection] Detected {len(landmarks)} landmarks")
                    for lm in landmarks:
                        pose_data["landmarks"].append({"x": lm.x, "y": lm.y})
                else:
                    print("[PoseDetection] No landmarks detected")
                process_frame_callback(pose_data)
            else:
                # Draw landmarks and skeleton lines
                if result.pose_landmarks:
                    landmarks = result.pose_landmarks[0]
                    print(f"[PoseDetection] Detected {len(landmarks)} landmarks")
                    for lm in landmarks:
                        x = int(lm.x * frame_width)
                        y = int(lm.y * frame_height)
                        cv2.circle(frame, (x, y), 5, (0, 255, 0), -1)
                    for start_idx, end_idx in POSE_CONNECTIONS:
                        x1, y1 = int(landmarks[start_idx].x * frame_width), int(landmarks[start_idx].y * frame_height)
                        x2, y2 = int(landmarks[end_idx].x * frame_width), int(landmarks[end_idx].y * frame_height)
                        cv2.line(frame, (x1, y1), (x2, y2), (0, 0, 255), 2)
                else:
                    print("[PoseDetection] No landmarks detected")

                cv2.imshow("Pose Skeleton", frame)
                if cv2.waitKey(1) & 0xFF == ord('q'):
                    break

    cap.release()
    if not process_frame_callback:
        cv2.destroyAllWindows()

if __name__ == "__main__":
    run_pose_detection()