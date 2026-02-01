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
  TOUCH_TOES: {
    name: "Touch Your Toes",
    description: "Touch your toes with straight legs",
    targetAngles: {
      leftKnee: 180,    // Legs must be straight
      rightKnee: 180
    },
    tolerance: 15
  },
  
  REACH_RIGHT_HIP: {
    name: "Reach Over Right Hip",
    description: "Bend over your right hip",
    targetAngles: {
      leftHip: 150,     // Left hip over 150 degrees
      rightHip: 115     // Right hip 115 degrees or less
    },
    tolerance: 20
  },

  REACH_LEFT_HIP: {
    name: "Reach Over Left Hip",
    description: "Bend over your left hip",
    targetAngles: {
      rightHip: 150,    // Right hip over 150 degrees
      leftHip: 115      // Left hip 115 degrees or less
    },
    tolerance: 20
  },

  MIDDLE_SPLITS: {
    name: "Middle Splits",
    description: "Wide leg split with straight legs",
    targetAngles: {
      leftHip: 90,      // Hips are 90 degrees
      rightHip: 90,
      leftKnee: 180,    // Knees are 180 degrees
      rightKnee: 180
    },
    tolerance: 25
  },

  RIGHT_LUNGE: {
    name: "Right Lunge",
    description: "Lunge with right leg forward",
    targetAngles: {
      rightKnee: 90,    // Right knee 90 degrees
      leftKnee: 180,    // Left knee 180 degrees
      rightHip: 80,     // Right hip 80 degrees
      leftHip: 145      // Left hip 145 degrees
    },
    tolerance: 20
  },

  LEFT_LUNGE: {
    name: "Left Lunge",
    description: "Lunge with left leg forward",
    targetAngles: {
      leftKnee: 90,     // Left knee 90 degrees
      rightKnee: 180,   // Right knee 180 degrees
      leftHip: 80,      // Left hip 80 degrees
      rightHip: 145     // Right hip 145 degrees
    },
    tolerance: 20
  },

  SPLITS: {
    name: "Front Splits",
    description: "Front splits with straight legs",
    targetAngles: {
      leftHip: 90,      // Hips 90 degrees
      rightHip: 90,
      leftKnee: 180,    // Knees 180 degrees
      rightKnee: 180
    },
    tolerance: 25
  },

  MIDDLE_SPLITS_LEFT: {
    name: "Middle Splits - Reach Left",
    description: "Reach towards the left in middle splits",
    targetAngles: {
      leftHip: 60,      // Left hip 60 degrees
      rightHip: 130,    // Right hip 130 degrees
      leftKnee: 180,    // Knees 180 degrees
      rightKnee: 180
    },
    tolerance: 20
  },

  MIDDLE_SPLITS_RIGHT: {
    name: "Middle Splits - Reach Right",
    description: "Reach towards the right in middle splits",
    targetAngles: {
      rightHip: 60,     // Right hip 60 degrees
      leftHip: 130,     // Left hip 130 degrees
      leftKnee: 180,    // Knees 180 degrees
      rightKnee: 180
    },
    tolerance: 20
  },

  KICK_LEFT_UP: {
    name: "Kick Left Leg Up",
    description: "Kick your left leg up high",
    targetAngles: {
      leftKnee: 180,    // Knees 180 degrees
      rightKnee: 180,
      rightHip: 180,    // Right hip 180 degrees
      leftHip: 40       // Left hip 40 degrees
    },
    tolerance: 25
  },

  KICK_RIGHT_UP: {
    name: "Kick Right Leg Up",
    description: "Kick your right leg up high",
    targetAngles: {
      leftKnee: 180,    // Knees 180 degrees
      rightKnee: 180,
      leftHip: 180,     // Left hip 180 degrees
      rightHip: 40      // Right hip 40 degrees
    },
    tolerance: 25
  },

  COBRA: {
    name: "Cobra Pose",
    description: "Back bend cobra pose",
    targetAngles: {
      spine: 25,        // Spine bend 25 degrees or less
      leftHip: 120,     // Hips 120 degrees or less
      rightHip: 120
    },
    tolerance: 15
  },

  BUTTERFLY: {
    name: "Butterfly Pose",
    description: "Butterfly with feet together",
    targetAngles: {
      leftKnee: 90,     // Knees less than 90 degrees
      rightKnee: 90
    },
    tolerance: 30
  },

  BUTTERFLY_REACH: {
    name: "Butterfly Reach",
    description: "Butterfly pose reaching forward",
    targetAngles: {
      leftKnee: 90,     // Knees less than 90 degrees
      rightKnee: 90,
      leftHip: 10,      // Hip less than 10 degrees
      rightHip: 10
    },
    tolerance: 15
  }
};

// Stretch sequence order
const STRETCH_SEQUENCE = [
  'TOUCH_TOES', 'REACH_RIGHT_HIP', 'REACH_LEFT_HIP', 'MIDDLE_SPLITS',
  'RIGHT_LUNGE', 'LEFT_LUNGE', 'SPLITS', 'MIDDLE_SPLITS_LEFT', 
  'MIDDLE_SPLITS_RIGHT', 'KICK_LEFT_UP', 'KICK_RIGHT_UP', 'COBRA',
  'BUTTERFLY', 'BUTTERFLY_REACH'
] as const;

type StretchKey = keyof typeof TARGET_STRETCHES;

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

  const { targetAngles, tolerance, name } = targetStretch;
  let totalScore = 0;
  let validAngles = 0;
  let feedback = [];

  // Special validation logic for different stretch types
  for (const [joint, targetAngle] of Object.entries(targetAngles)) {
    const currentAngle = currentAngles[joint as keyof typeof currentAngles];
    const target = targetAngle as number;
    
    if (currentAngle !== undefined && typeof currentAngle === 'number') {
      let angleScore = 0;
      let difference = 0;
      
      // Special cases for poses that require "less than" validation
      if (name.includes('Cobra') && (joint.includes('spine') || joint.includes('Hip'))) {
        // For cobra: spine ≤25°, hips ≤120°
        if (currentAngle <= target) {
          angleScore = 100;
          difference = 0;
        } else {
          difference = currentAngle - target;
          angleScore = Math.max(0, 100 - (difference / tolerance) * 100);
        }
      } else if (name.includes('Butterfly') && joint.includes('Knee')) {
        // For butterfly: knees <90°
        if (currentAngle < target) {
          angleScore = 100;
          difference = 0;
        } else {
          difference = currentAngle - target;
          angleScore = Math.max(0, 100 - (difference / tolerance) * 100);
        }
      } else if (name.includes('Butterfly Reach') && joint.includes('Hip')) {
        // For butterfly reach: hips <10°
        if (currentAngle < target) {
          angleScore = 100;
          difference = 0;
        } else {
          difference = currentAngle - target;
          angleScore = Math.max(0, 100 - (difference / tolerance) * 100);
        }
      } else if (name.includes('Right Hip') && joint === 'leftHip') {
        // For reach right hip: left hip >150°
        if (currentAngle >= target) {
          angleScore = 100;
          difference = 0;
        } else {
          difference = target - currentAngle;
          angleScore = Math.max(0, 100 - (difference / tolerance) * 100);
        }
      } else if (name.includes('Right Hip') && joint === 'rightHip') {
        // For reach right hip: right hip ≤115°
        if (currentAngle <= target) {
          angleScore = 100;
          difference = 0;
        } else {
          difference = currentAngle - target;
          angleScore = Math.max(0, 100 - (difference / tolerance) * 100);
        }
      } else if (name.includes('Left Hip') && joint === 'rightHip') {
        // For reach left hip: right hip >150°
        if (currentAngle >= target) {
          angleScore = 100;
          difference = 0;
        } else {
          difference = target - currentAngle;
          angleScore = Math.max(0, 100 - (difference / tolerance) * 100);
        }
      } else if (name.includes('Left Hip') && joint === 'leftHip') {
        // For reach left hip: left hip ≤115°
        if (currentAngle <= target) {
          angleScore = 100;
          difference = 0;
        } else {
          difference = currentAngle - target;
          angleScore = Math.max(0, 100 - (difference / tolerance) * 100);
        }
      } else {
        // Standard validation: target ± tolerance
        difference = Math.abs(currentAngle - target);
        angleScore = Math.max(0, 100 - (difference / tolerance) * 100);
      }
      
      totalScore += angleScore;
      validAngles++;
      
      console.log(`${joint}: current=${Math.round(currentAngle)}°, target=${target}°, diff=${Math.round(difference)}°, score=${Math.round(angleScore)}`);
      
      if (angleScore < 70) {
        feedback.push(`Adjust your ${joint.replace(/([A-Z])/g, ' $1').toLowerCase()}`);
      }
    }
  }

  const finalScore = validAngles > 0 ? Math.round(totalScore / validAngles) : 0;
  const isMatch = finalScore >= 75; // 75% threshold for completion

  console.log(`Final validation: score=${finalScore}%, isMatch=${isMatch}, validAngles=${validAngles}`);

  return {
    score: finalScore,
    isMatch,
    feedback: isMatch ? "Perfect stretch!" : feedback.slice(0, 2).join(", ") || "Keep trying!"
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
  onPoseMatch?: (isMatch: boolean, score: number, currentStretch: string, isComplete: boolean) => void;
  showDebug?: boolean;
}

const PoseCamera: React.FC<PoseCameraProps> = ({ 
  onPoseMatch,
  showDebug = true  // Temporarily enable debug by default
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [poseValidation, setPoseValidation] = useState<any>(null);
  const [currentAngles, setCurrentAngles] = useState<any>(null);
  const [showGoodJob, setShowGoodJob] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentStretchIndex, setCurrentStretchIndex] = useState(0);
  
  const currentStretchKey = STRETCH_SEQUENCE[currentStretchIndex] as StretchKey;
  const currentStretch = TARGET_STRETCHES[currentStretchKey];
  
  // Manual next stretch function
  const nextStretch = () => {
    if (currentStretchIndex < STRETCH_SEQUENCE.length - 1) {
      setCurrentStretchIndex(prev => prev + 1);
      setShowGoodJob(false);
    } else {
      // All stretches completed!
      alert('🎉 Congratulations! You completed all stretches! 🎉');
    }
  };

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
            const angles = extractJointAngles(landmarks);
            const validation = validatePose(angles, currentStretch);

            setCurrentAngles(angles);
            setPoseValidation(validation);

            // Show good job message for high scores
            if (validation.score >= 75) {
              if (!showGoodJob) {
                setShowGoodJob(true);
                setTimeout(() => setShowGoodJob(false), 2000); // Hide after 2 seconds
              }
            }

            // Call parent callback for rhythm game logic
            if (onPoseMatch) {
              const isComplete = currentStretchIndex >= STRETCH_SEQUENCE.length - 1;
              onPoseMatch(validation.isMatch || false, validation.score || 0, currentStretch.name, isComplete);
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
  }, [onPoseMatch, currentStretchKey]);

  return (
    <div style={{ position: "relative", width: 640, height: 480, backgroundColor: "#000" }}>
      {isLoading && (
        <div style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          color: "white",
          fontSize: "18px",
          textAlign: "center"
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
          borderRadius: "8px"
        }}>
          Error: {error}<br/>
          Please refresh and allow camera access
        </div>
      )}
      
      <video 
        ref={videoRef} 
        style={{ position: "absolute", width: 640, height: 480, transform: "scaleX(-1)" }} 
        autoPlay 
        playsInline 
        muted 
      />
      <canvas 
        ref={canvasRef} 
        width={640} 
        height={480} 
        style={{ position: "absolute", left: 0, top: 0, transform: "scaleX(-1)" }} 
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
        padding: "15px",
        borderRadius: "8px",
        fontSize: "16px",
        fontWeight: "bold",
        minWidth: "250px"
      }}>
        <div style={{ color: "#00FF00", fontSize: "18px", marginBottom: "8px" }}>
          Stretch {currentStretchIndex + 1} of {STRETCH_SEQUENCE.length}
        </div>
        <div style={{ color: poseValidation?.isMatch ? "#00FF00" : "#FF6600", marginBottom: "5px" }}>
          Score: {poseValidation?.score || 0}%
        </div>
        <div style={{ fontSize: "14px", marginTop: "5px", color: "#CCCCCC" }}>
          {poseValidation?.feedback || "Get into position"}
        </div>
        
        {/* Next Stretch Button */}
        <button 
          onClick={nextStretch}
          disabled={currentStretchIndex >= STRETCH_SEQUENCE.length - 1}
          style={{
            marginTop: "15px",
            padding: "12px 20px",
            backgroundColor: currentStretchIndex >= STRETCH_SEQUENCE.length - 1 ? "#666" : "#00FF00",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "14px",
            fontWeight: "bold",
            cursor: currentStretchIndex >= STRETCH_SEQUENCE.length - 1 ? "not-allowed" : "pointer",
            transition: "background-color 0.2s",
            width: "100%"
          }}
          onMouseOver={(e) => {
            if (currentStretchIndex < STRETCH_SEQUENCE.length - 1) {
              e.currentTarget.style.backgroundColor = "#00CC00";
            }
          }}
          onMouseOut={(e) => {
            if (currentStretchIndex < STRETCH_SEQUENCE.length - 1) {
              e.currentTarget.style.backgroundColor = "#00FF00";
            }
          }}
        >
          {currentStretchIndex >= STRETCH_SEQUENCE.length - 1 ? "All Complete! 🎉" : "Next Stretch →"}
        </button>
      </div>

      {/* Target Stretch Info */}
      <div style={{
        position: "absolute",
        bottom: 10,
        left: 10,
        right: 10,
        backgroundColor: "rgba(0,0,0,0.9)",
        color: "white",
        padding: "20px",
        borderRadius: "8px",
        textAlign: "center",
        border: "2px solid #00FF00"
      }}>
        <div style={{ fontSize: "24px", fontWeight: "bold", marginBottom: "8px", color: "#00FF00" }}>
          {currentStretch?.name}
        </div>
        <div style={{ fontSize: "16px", marginBottom: "10px" }}>
          {currentStretch?.description}
        </div>
        <div style={{ fontSize: "14px", color: "#FFAA00" }}>
          Try your best, then click "Next Stretch" to continue!
        </div>
        {currentStretchIndex === STRETCH_SEQUENCE.length - 1 && (
          <div style={{ fontSize: "12px", color: "#FF6600", marginTop: "5px" }}>
            🏆 FINAL STRETCH! 🏆
          </div>
        )}
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
            <div>Left Arm: {Math.round(currentAngles.leftArm)}° (target: {currentStretch?.targetAngles.leftArm || 'N/A'}°)</div>
            <div>Right Arm: {Math.round(currentAngles.rightArm)}° (target: {currentStretch?.targetAngles.rightArm || 'N/A'}°)</div>
            <div>Left Shoulder: {Math.round(currentAngles.leftShoulder)}° (target: {currentStretch?.targetAngles.leftShoulder || 'N/A'}°)</div>
            <div>Right Shoulder: {Math.round(currentAngles.rightShoulder)}° (target: {currentStretch?.targetAngles.rightShoulder || 'N/A'}°)</div>
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
              <strong>Current Target:</strong> {currentStretch?.name}<br/>
              <strong>Progress:</strong> {currentStretchIndex + 1}/{STRETCH_SEQUENCE.length}<br/>
              <strong>Live MediaPipe Analysis:</strong> All 33 landmarks tracked
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PoseCamera;
