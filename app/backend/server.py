from fastapi import FastAPI, WebSocket
import uvicorn
import json
import threading
import queue
from backend.mediapipe.pose_detection import run_pose_detection
app = FastAPI()

@app.websocket("/ws/pose")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    pose_queue = queue.Queue()

    def callback(pose_data):
        pose_queue.put(pose_data)

    t = threading.Thread(target=run_pose_detection, args=(callback,), daemon=True)
    t.start()
    try:
        while True:
            pose_data = pose_queue.get()
            await websocket.send_text(json.dumps(pose_data))
            try:
                await websocket.receive_text()
            except Exception:
                break
    finally:
        pass

if __name__ == "__main__":
    uvicorn.run("server:app", host="0.0.0.0", port=8000, reload=True)
