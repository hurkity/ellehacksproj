
from fastapi import FastAPI, WebSocket
import uvicorn
import json
import cv2
import mediapipe as mp
from mediapipe.tasks.python import BaseOptions
from mediapipe.tasks.python.vision import PoseLandmarker, PoseLandmarkerOptions, RunningMode
import numpy as np

MODEL_PATH = "app/shared/models/pose_landmarker_lite.task"

app = FastAPI()

def get_pose_landmarker():
    options = PoseLandmarkerOptions(
        base_options=BaseOptions(model_asset_path=MODEL_PATH),
        running_mode=RunningMode.IMAGE
    )
    return PoseLandmarker.create_from_options(options)

@app.websocket("/ws/pose")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    if not cap.isOpened():
        await websocket.send_text(json.dumps({"error": "Could not open webcam"}))
        await websocket.close()
        return
    frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    with get_pose_landmarker() as landmarker:
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    continue
                frame_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
                mp_image = mp.Image(image_format=mp.ImageFormat.SRGB, data=frame_rgb)
                result = landmarker.detect(mp_image)
                pose_data = {"landmarks": []}
                if result.pose_landmarks:
                    landmarks = result.pose_landmarks[0]
                    for lm in landmarks:
                        pose_data["landmarks"].append({"x": lm.x, "y": lm.y})
                await websocket.send_text(json.dumps(pose_data))
                # Optionally, wait for a message from the client to throttle
                try:
                    await websocket.receive_text()
                except Exception:
                    break
        finally:
            cap.release()

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
