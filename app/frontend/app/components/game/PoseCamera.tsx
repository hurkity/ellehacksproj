"use client";
import React, { useRef, useEffect } from "react";


// POSE_CONNECTIONS is not exported from @mediapipe/pose, so define it here
const POSE_CONNECTIONS = [
  [0,11],[0,12],[11,12],[11,13],[13,15],[12,14],[14,16],
  [15,17],[16,18],[17,19],[18,20],
  [23,25],[24,26],[25,27],[26,28],[27,29],[28,30],
  [11,23],[12,24]
];

const drawLandmarks = (ctx: CanvasRenderingContext2D, landmarks: any[]) => {
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  // Draw connections
  POSE_CONNECTIONS.forEach(([start, end]) => {
    const s = landmarks[start];
    const e = landmarks[end];
    if (s && e) {
      ctx.beginPath();
      ctx.moveTo(s.x * ctx.canvas.width, s.y * ctx.canvas.height);
      ctx.lineTo(e.x * ctx.canvas.width, e.y * ctx.canvas.height);
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  });
  // Draw points
  landmarks.forEach((lm) => {
    ctx.beginPath();
    ctx.arc(lm.x * ctx.canvas.width, lm.y * ctx.canvas.height, 5, 0, 2 * Math.PI);
    ctx.fillStyle = "#FF0000";
    ctx.fill();
  });
};

const PoseCamera: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Dynamically load MediaPipe scripts and use window.Pose/Camera
  useEffect(() => {
    let camera: any = null;
    let pose: any = null;
    let running = true;
    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src=\"${src}\"]`)) {
          resolve();
          return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.async = true;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.body.appendChild(script);
      });
    };
    const setup = async () => {
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
      // @ts-ignore
      const Pose = (window as any).Pose;
      // @ts-ignore
      const Camera = (window as any).Camera;
      if (!videoRef.current || !canvasRef.current || !Pose || !Camera) return;
      pose = new Pose({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });
      pose.setOptions({
        modelComplexity: 0,
        smoothLandmarks: true,
        enableSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });
      pose.onResults((results: any) => {
        if (!running) return;
        if (results.poseLandmarks && canvasRef.current) {
          const ctx = canvasRef.current.getContext("2d");
          if (ctx) drawLandmarks(ctx, results.poseLandmarks);
        }
      });
      camera = new Camera(videoRef.current, {
        onFrame: async () => {
          await pose.send({ image: videoRef.current! });
        },
        width: 640,
        height: 480,
      });
      camera.start();
    };
    setup();
    return () => {
      running = false;
      if (camera) camera.stop();
      if (pose) pose.close();
    };
  }, []);

  return (
    <div style={{ position: "relative", width: 640, height: 480 }}>
      <video ref={videoRef} style={{ position: "absolute", width: 640, height: 480 }} autoPlay playsInline muted />
      <canvas ref={canvasRef} width={640} height={480} style={{ position: "absolute", left: 0, top: 0 }} />
    </div>
  );
};

export default PoseCamera;
