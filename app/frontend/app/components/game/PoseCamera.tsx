"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

// MediaPipe pose landmark indices - ALL 33 landmarks
const LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1,
  LEFT_EYE: 2,
  LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4,
  RIGHT_EYE: 5,
  RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7,
  RIGHT_EAR: 8,
  MOUTH_LEFT: 9,
  MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_PINKY: 17,
  RIGHT_PINKY: 18,
  LEFT_INDEX: 19,
  RIGHT_INDEX: 20,
  LEFT_THUMB: 21,
  RIGHT_THUMB: 22,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31,
  RIGHT_FOOT_INDEX: 32,
};

// Target poses with specific joint angles for rhythm game
const TARGET_STRETCHES = {
  ARMS_UP: {
    name: "Arms Up Stretch",
    description: "Raise both arms straight up",
    targetAngles: {
      leftArm: 160,    // Shoulder-Elbow-Wrist angle
      rightArm: 160,
      leftShoulder: 170,  // Hip-Shoulder-Elbow angle 
      rightShoulder: 170
    },
    tolerance: 30 // degrees tolerance
  },
  
  T_POSE: {
    name: "T-Pose Stretch", 
    description: "Extend arms out to sides like a T",
    targetAngles: {
      leftArm: 170,
      rightArm: 170,
      leftShoulder: 90,  // Arms out to sides
      rightShoulder: 90
    },
    tolerance: 25
  },

  WARRIOR: {
    name: "Warrior Pose",
    description: "Wide stance, arms extended",
    targetAngles: {
      leftArm: 170,
      rightArm: 170,
      leftKnee: 170,   // Hip-Knee-Ankle angle (mostly straight)
      rightKnee: 170
    },
    tolerance: 30
  },

  SIDE_BEND: {
    name: "Side Bend",
    description: "Bend to one side, one arm up",
    targetAngles: {
      leftArm: 160,
      rightArm: 120,    // Different arm positions
    },
    tolerance: 35
  }
};

// Calculate angle between three points
const calculateAngle = (a: any, b: any, c: any): number => {
  if (!a || !b || !c) return 0;
  
  // Calculate vectors
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  
  // Calculate dot product and magnitudes
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
  
  if (magBA === 0 || magBC === 0) return 0;
  
  // Calculate angle in degrees
  const cosAngle = dot / (magBA * magBC);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
  
  return angle;
};

// Extract ALL joint angles from pose landmarks
const extractJointAngles = (landmarks: any[]) => {
  if (!landmarks || landmarks.length < 33) return null;

  const safeAngle = (a: any, b: any, c: any, name: string) => {
    try {
      const angle = calculateAngle(a, b, c);
      return isNaN(angle) ? 0 : angle;
    } catch (e) {
      console.warn(`Error calculating ${name} angle:`, e);
      return 0;
    }
  };

  return {
    // ARM ANGLES (Shoulder-Elbow-Wrist)
    leftArm: safeAngle(
      landmarks[LANDMARKS.LEFT_SHOULDER],
      landmarks[LANDMARKS.LEFT_ELBOW], 
      landmarks[LANDMARKS.LEFT_WRIST],
      'leftArm'
    ),
    rightArm: safeAngle(
      landmarks[LANDMARKS.RIGHT_SHOULDER],
      landmarks[LANDMARKS.RIGHT_ELBOW],
      landmarks[LANDMARKS.RIGHT_WRIST],
      'rightArm'
    ),
    
    // SHOULDER ANGLES (Hip-Shoulder-Elbow)
    leftShoulder: safeAngle(
      landmarks[LANDMARKS.LEFT_HIP],
      landmarks[LANDMARKS.LEFT_SHOULDER],
      landmarks[LANDMARKS.LEFT_ELBOW],
      'leftShoulder'
    ),
    rightShoulder: safeAngle(
      landmarks[LANDMARKS.RIGHT_HIP], 
      landmarks[LANDMARKS.RIGHT_SHOULDER],
      landmarks[LANDMARKS.RIGHT_ELBOW],
      'rightShoulder'
    ),
    
    // KNEE ANGLES (Hip-Knee-Ankle)
    leftKnee: safeAngle(
      landmarks[LANDMARKS.LEFT_HIP],
      landmarks[LANDMARKS.LEFT_KNEE],
      landmarks[LANDMARKS.LEFT_ANKLE],
      'leftKnee'
    ),
    rightKnee: safeAngle(
      landmarks[LANDMARKS.RIGHT_HIP],
      landmarks[LANDMARKS.RIGHT_KNEE], 
      landmarks[LANDMARKS.RIGHT_ANKLE],
      'rightKnee'
    ),
    
    // HIP ANGLES (Shoulder-Hip-Knee)
    leftHip: safeAngle(
      landmarks[LANDMARKS.LEFT_SHOULDER],
      landmarks[LANDMARKS.LEFT_HIP],
      landmarks[LANDMARKS.LEFT_KNEE],
      'leftHip'
    ),
    rightHip: safeAngle(
      landmarks[LANDMARKS.RIGHT_SHOULDER],
      landmarks[LANDMARKS.RIGHT_HIP],
      landmarks[LANDMARKS.RIGHT_KNEE],
      'rightHip'
    ),
    
    // ANKLE ANGLES (Knee-Ankle-Heel)
    leftAnkle: safeAngle(
      landmarks[LANDMARKS.LEFT_KNEE],
      landmarks[LANDMARKS.LEFT_ANKLE],
      landmarks[LANDMARKS.LEFT_HEEL],
      'leftAnkle'
    ),
    rightAnkle: safeAngle(
      landmarks[LANDMARKS.RIGHT_KNEE],
      landmarks[LANDMARKS.RIGHT_ANKLE],
      landmarks[LANDMARKS.RIGHT_HEEL],
      'rightAnkle'
    ),
    
    // FOOT ANGLES (Ankle-Heel-FootIndex)
    leftFoot: safeAngle(
      landmarks[LANDMARKS.LEFT_ANKLE],
      landmarks[LANDMARKS.LEFT_HEEL],
      landmarks[LANDMARKS.LEFT_FOOT_INDEX],
      'leftFoot'
    ),
    rightFoot: safeAngle(
      landmarks[LANDMARKS.RIGHT_ANKLE],
      landmarks[LANDMARKS.RIGHT_HEEL],
      landmarks[LANDMARKS.RIGHT_FOOT_INDEX],
      'rightFoot'
    ),
    
    // WRIST ANGLES (Elbow-Wrist-Index)
    leftWrist: safeAngle(
      landmarks[LANDMARKS.LEFT_ELBOW],
      landmarks[LANDMARKS.LEFT_WRIST],
      landmarks[LANDMARKS.LEFT_INDEX],
      'leftWrist'
    ),
    rightWrist: safeAngle(
      landmarks[LANDMARKS.RIGHT_ELBOW],
      landmarks[LANDMARKS.RIGHT_WRIST],
      landmarks[LANDMARKS.RIGHT_INDEX],
      'rightWrist'
    ),
    
    // NECK ANGLES (Shoulder-Shoulder-Nose)
    neckTilt: safeAngle(
      landmarks[LANDMARKS.LEFT_SHOULDER],
      landmarks[LANDMARKS.RIGHT_SHOULDER],
      landmarks[LANDMARKS.NOSE],
      'neckTilt'
    ),
    
    // HEAD ANGLES (Ear-Nose-Ear)
    headTilt: safeAngle(
      landmarks[LANDMARKS.LEFT_EAR],
      landmarks[LANDMARKS.NOSE],
      landmarks[LANDMARKS.RIGHT_EAR],
      'headTilt'
    ),
    
    // TORSO ANGLES (Shoulder-Hip center)
    torsoLean: safeAngle(
      landmarks[LANDMARKS.LEFT_SHOULDER],
      { 
        x: (landmarks[LANDMARKS.LEFT_HIP].x + landmarks[LANDMARKS.RIGHT_HIP].x) / 2,
        y: (landmarks[LANDMARKS.LEFT_HIP].y + landmarks[LANDMARKS.RIGHT_HIP].y) / 2
      },
      landmarks[LANDMARKS.RIGHT_SHOULDER],
      'torsoLean'
    ),
    
    // SPINE BEND (approximate using shoulder to hip distance)
    spine: Math.abs(landmarks[LANDMARKS.LEFT_SHOULDER].x - landmarks[LANDMARKS.LEFT_HIP].x) * 180,
    
    // BODY SYMMETRY ANGLES
    shoulderBalance: Math.abs(landmarks[LANDMARKS.LEFT_SHOULDER].y - landmarks[LANDMARKS.RIGHT_SHOULDER].y) * 180,
    hipBalance: Math.abs(landmarks[LANDMARKS.LEFT_HIP].y - landmarks[LANDMARKS.RIGHT_HIP].y) * 180,
  };
};

// Compare current angles to target pose
const validatePose = (currentAngles: any, targetStretch: any) => {
  if (!currentAngles || !targetStretch) return { score: 0, isMatch: false, feedback: "No pose detected" };

  const { targetAngles, tolerance } = targetStretch;
  let totalScore = 0;
  let validAngles = 0;
  let feedback = [];

  // Check each target angle
  for (const [joint, targetAngle] of Object.entries(targetAngles)) {
    const currentAngle = currentAngles[joint as keyof typeof currentAngles];
    const target = targetAngle as number;
    
    if (currentAngle !== undefined && typeof currentAngle === 'number') {
      const difference = Math.abs(currentAngle - target);
      const angleScore = Math.max(0, 100 - (difference / tolerance) * 100);
      totalScore += angleScore;
      validAngles++;
      
      console.log(`${joint}: current=${Math.round(currentAngle)}°, target=${target}°, diff=${Math.round(difference)}°, score=${Math.round(angleScore)}`);
      
      if (difference > tolerance) {
        feedback.push(`Adjust your ${joint}`);
      }
    }
  }

  const finalScore = validAngles > 0 ? Math.round(totalScore / validAngles) : 0;
  const isMatch = finalScore >= 70; // Lowered threshold for easier matching

  console.log(`Final validation: score=${finalScore}%, isMatch=${isMatch}, validAngles=${validAngles}`);

  return {
    score: finalScore,
    isMatch,
    feedback: isMatch ? "Perfect pose!" : feedback.slice(0, 2).join(", ") || "Keep trying!"
  };
};

// Draw pose with angle feedback
const drawPoseWithAngles = (ctx: CanvasRenderingContext2D, landmarks: any[], validation: any) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  ctx.clearRect(0, 0, width, height);
  
  // Draw skeleton
  const connections = [
    [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW],
    [LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST],
    [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW],
    [LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST],
    [LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER],
    [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP],
    [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP],
    [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
    [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE],
    [LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
    [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE],
    [LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE]
  ];
  
  // Draw connections
  ctx.strokeStyle = validation?.isMatch ? "#00FF00" : "#FF6600";
  ctx.lineWidth = 3;
  connections.forEach(([start, end]) => {
    const startPoint = landmarks[start];
    const endPoint = landmarks[end];
    if (startPoint && endPoint) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x * width, startPoint.y * height);
      ctx.lineTo(endPoint.x * width, endPoint.y * height);
      ctx.stroke();
    }
  });
  
  // Draw key points
  ctx.fillStyle = validation?.isMatch ? "#00FF00" : "#FF6600";
  [LANDMARKS.LEFT_WRIST, LANDMARKS.RIGHT_WRIST, LANDMARKS.LEFT_SHOULDER, 
   LANDMARKS.RIGHT_SHOULDER, LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP].forEach(idx => {
    const point = landmarks[idx];
    if (point) {
      ctx.beginPath();
      ctx.arc(point.x * width, point.y * height, 6, 0, 2 * Math.PI);
      ctx.fill();
    }
  });
};

interface PoseCameraProps {
  targetStretch?: keyof typeof TARGET_STRETCHES;
  onPoseMatch?: (isMatch: boolean, score: number) => void;
  showDebug?: boolean;
}

const PoseCamera: React.FC<PoseCameraProps> = ({ 
  targetStretch,
  onPoseMatch,
  showDebug = true
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseValidation, setPoseValidation] = useState<any>(null);
  const [currentAngles, setCurrentAngles] = useState<any>(null);
  const [showGoodJob, setShowGoodJob] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to always access latest props in callbacks
  const targetStretchRef = useRef(targetStretch);
  const onPoseMatchRef = useRef(onPoseMatch);
  useEffect(() => { targetStretchRef.current = targetStretch; }, [targetStretch]);
  useEffect(() => { onPoseMatchRef.current = onPoseMatch; }, [onPoseMatch]);

  useEffect(() => {
    let camera: any = null;
    let pose: any = null;
    let running = true;

    const loadScript = (src: string) => {
      return new Promise<void>((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
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
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('Loading MediaPipe scripts...');
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/pose/pose.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
        
        // Wait a bit for scripts to initialize
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const Pose = (window as any).Pose;
        const Camera = (window as any).Camera;
        
        if (!videoRef.current || !canvasRef.current) {
          throw new Error('Video or canvas ref not available');
        }
        
        if (!Pose || !Camera) {
          throw new Error('MediaPipe libraries not loaded');
        }
        
        console.log('MediaPipe libraries loaded successfully');

        pose = new Pose({
          locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
        });

        pose.setOptions({
          modelComplexity: 1,
          smoothLandmarks: true,
          enableSegmentation: false,
          minDetectionConfidence: 0.5,
          minTrackingConfidence: 0.5,
        });

        pose.onResults((results: any) => {
          if (!running) return;
          if (results.poseLandmarks && canvasRef.current) {
            const landmarks = results.poseLandmarks;
            // Only validate pose if a targetStretch is provided
            let validation = null;
            const currentTarget = targetStretchRef.current;
            if (currentTarget && TARGET_STRETCHES[currentTarget]) {
              const angles = extractJointAngles(landmarks);
              const targetPose = TARGET_STRETCHES[currentTarget];
              validation = validatePose(angles, targetPose);
              setCurrentAngles(angles);
              setPoseValidation(validation);
              // Show good job message for high scores
              if (validation.score >= 70) {
                setShowGoodJob(true);
                setTimeout(() => setShowGoodJob(false), 2000);
              }
              // Call parent callback for rhythm game logic
              if (onPoseMatchRef.current) {
                onPoseMatchRef.current(validation.isMatch || false, validation.score || 0);
              }
            } else {
              setPoseValidation(null);
              setCurrentAngles(null);
            }
            const ctx = canvasRef.current.getContext("2d");
            if (ctx) {
              drawPoseWithAngles(ctx, landmarks, validation);
            }
          }
        });

        camera = new Camera(videoRef.current, {
          onFrame: async () => {
            if (running && pose) {
              try {
                await pose.send({ image: videoRef.current! });
              } catch (err) {
                console.warn('Frame processing error:', err);
              }
            }
          },
          width: 640,
          height: 480,
        });

        await camera.start();
        setIsLoading(false);
        console.log('Camera started successfully');
      } catch (error) {
        console.error("Error setting up pose detection:", error);
        setError(`Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        setIsLoading(false);
      }
    };

    setup();

    return () => {
      running = false;
      if (camera) camera.stop();
      if (pose) pose.close();
    };
  }, []); // Only run once on mount

  return (
    <div style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", backgroundColor: "#000", zIndex: 1 }}>
      {isLoading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: "18px",
          textAlign: "center",
          zIndex: 10
        }}>
          Loading camera and pose detection...
        </div>
      )}
      {error && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "red",
          fontSize: "16px",
          textAlign: "center",
          padding: "20px",
          backgroundColor: "rgba(0,0,0,0.8)",
          borderRadius: "8px",
          zIndex: 10
        }}>
          Error: {error}<br/>
          Please refresh and allow camera access
        </div>
      )}
      <video 
        ref={videoRef} 
        style={{ position: "absolute", top: 0, left: 0, width: "100vw", height: "100vh", objectFit: "cover", transform: "scaleX(-1)", zIndex: 1 }} 
        autoPlay 
        playsInline 
        muted 
      />
      <canvas 
        ref={canvasRef} 
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ position: "absolute", left: 0, top: 0, width: "100vw", height: "100vh", pointerEvents: "none", transform: "scaleX(-1)", zIndex: 2 }} 
      />
      {/* Good Job Message */}
      {showGoodJob && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "rgba(0, 255, 0, 0.9)",
          color: "white",
          padding: "20px 40px",
          borderRadius: "15px",
          fontSize: "24px",
          fontWeight: "bold",
          textAlign: "center",
          animation: "pulse 0.5s ease-in-out",
          boxShadow: "0 0 20px rgba(0, 255, 0, 0.5)",
          zIndex: 1000
        }}>
          🎉 GOOD JOB! 🎉
        </div>
      )}
      
      {/* Score Display */}
      <div style={{
        position: "absolute",
        top: 10,
        left: 10,
        backgroundColor: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "10px",
        borderRadius: "8px",
        fontSize: "18px",
        fontWeight: "bold"
      }}>
        <div style={{ color: poseValidation?.isMatch ? "#00FF00" : "#FF6600" }}>
          Score: {poseValidation?.score || 0}%
        </div>
        <div style={{ fontSize: "14px", marginTop: "5px" }}>
          {poseValidation?.feedback || "Get into position"}
        </div>
      </div>

      {/* Target Stretch Info */}
      <div style={{
        position: "absolute",
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.8)",
        color: "white",
        padding: "15px",
        borderRadius: "8px",
        textAlign: "center"
      }}>
        <div style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "5px" }}>
          {TARGET_STRETCHES[targetStretch]?.name}
        </div>
        <div style={{ fontSize: "14px" }}>
          {TARGET_STRETCHES[targetStretch]?.description}
        </div>
      </div>

      {/* Debug angles display */}
      {showDebug && currentAngles && (
        <div style={{
          position: "fixed",
          top: "50px",
          right: "20px",
          backgroundColor: "rgba(0,0,0,0.95)",
          color: "white",
          padding: "15px",
          borderRadius: "8px",
          fontSize: "11px",
          width: "320px",
          maxHeight: "calc(100vh - 100px)",
          overflowY: "auto",
          border: "1px solid #333",
          zIndex: 1000
        }}>
          <div style={{ fontWeight: "bold", marginBottom: "12px", fontSize: "14px", color: "#00FF00" }}>ALL BODY ANGLES - LIVE</div>
          
          <div style={{ marginBottom: "10px" }}>
            <div style={{ color: "#FFD700", fontWeight: "bold", borderBottom: "1px solid #333", paddingBottom: "2px" }}>ARMS & SHOULDERS:</div>
            <div>Left Arm: {Math.round(currentAngles.leftArm)}° (target: {TARGET_STRETCHES[targetStretch]?.targetAngles.leftArm || 'N/A'}°)</div>
            <div>Right Arm: {Math.round(currentAngles.rightArm)}° (target: {TARGET_STRETCHES[targetStretch]?.targetAngles.rightArm || 'N/A'}°)</div>
            <div>Left Shoulder: {Math.round(currentAngles.leftShoulder)}° (target: {TARGET_STRETCHES[targetStretch]?.targetAngles.leftShoulder || 'N/A'}°)</div>
            <div>Right Shoulder: {Math.round(currentAngles.rightShoulder)}° (target: {TARGET_STRETCHES[targetStretch]?.targetAngles.rightShoulder || 'N/A'}°)</div>
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <div style={{ color: "#FF6B6B", fontWeight: "bold", borderBottom: "1px solid #333", paddingBottom: "2px" }}>LEGS & HIPS:</div>
            <div>Left Hip: {Math.round(currentAngles.leftHip)}°</div>
            <div>Right Hip: {Math.round(currentAngles.rightHip)}°</div>
            <div>Left Knee: {Math.round(currentAngles.leftKnee)}°</div>
            <div>Right Knee: {Math.round(currentAngles.rightKnee)}°</div>
            <div>Left Ankle: {Math.round(currentAngles.leftAnkle)}°</div>
            <div>Right Ankle: {Math.round(currentAngles.rightAnkle)}°</div>
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <div style={{ color: "#4ECDC4", fontWeight: "bold", borderBottom: "1px solid #333", paddingBottom: "2px" }}>FEET & HANDS:</div>
            <div>Left Foot: {Math.round(currentAngles.leftFoot)}°</div>
            <div>Right Foot: {Math.round(currentAngles.rightFoot)}°</div>
            <div>Left Wrist: {Math.round(currentAngles.leftWrist)}°</div>
            <div>Right Wrist: {Math.round(currentAngles.rightWrist)}°</div>
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <div style={{ color: "#95E1D3", fontWeight: "bold", borderBottom: "1px solid #333", paddingBottom: "2px" }}>HEAD & NECK:</div>
            <div>Head Tilt: {Math.round(currentAngles.headTilt)}°</div>
            <div>Neck Tilt: {Math.round(currentAngles.neckTilt)}°</div>
          </div>
          
          <div style={{ marginBottom: "10px" }}>
            <div style={{ color: "#F38BA8", fontWeight: "bold", borderBottom: "1px solid #333", paddingBottom: "2px" }}>TORSO & POSTURE:</div>
            <div>Torso Lean: {Math.round(currentAngles.torsoLean)}°</div>
            <div>Spine Bend: {Math.round(currentAngles.spine)}°</div>
            <div>Shoulder Balance: {Math.round(currentAngles.shoulderBalance)}°</div>
            <div>Hip Balance: {Math.round(currentAngles.hipBalance)}°</div>
          </div>
          
          <div style={{ marginTop: "12px", padding: "8px", backgroundColor: "rgba(255,255,255,0.1)", borderRadius: "4px" }}>
            <div style={{ fontSize: "10px", color: "#CCCCCC" }}>
              <strong>Current Target:</strong> {TARGET_STRETCHES[targetStretch]?.name}<br/>
              <strong>Live MediaPipe Analysis:</strong> All 33 landmarks tracked
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoseCamera;
