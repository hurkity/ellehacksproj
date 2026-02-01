"use client";
import React, { useRef, useEffect, useState, useCallback } from "react";

// ===================================
// MEDIAPIPE LANDMARKS CONFIGURATION
// ===================================
const LANDMARKS = {
  NOSE: 0,
  LEFT_EYE_INNER: 1, LEFT_EYE: 2, LEFT_EYE_OUTER: 3,
  RIGHT_EYE_INNER: 4, RIGHT_EYE: 5, RIGHT_EYE_OUTER: 6,
  LEFT_EAR: 7, RIGHT_EAR: 8,
  MOUTH_LEFT: 9, MOUTH_RIGHT: 10,
  LEFT_SHOULDER: 11, RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13, RIGHT_ELBOW: 14,
  LEFT_WRIST: 15, RIGHT_WRIST: 16,
  LEFT_PINKY: 17, RIGHT_PINKY: 18,
  LEFT_INDEX: 19, RIGHT_INDEX: 20,
  LEFT_THUMB: 21, RIGHT_THUMB: 22,
  LEFT_HIP: 23, RIGHT_HIP: 24,
  LEFT_KNEE: 25, RIGHT_KNEE: 26,
  LEFT_ANKLE: 27, RIGHT_ANKLE: 28,
  LEFT_HEEL: 29, RIGHT_HEEL: 30,
  LEFT_FOOT_INDEX: 31, RIGHT_FOOT_INDEX: 32,
};

// ===================================
// UTILITY FUNCTIONS
// ===================================
const calculateAngle = (a: any, b: any, c: any): number => {
  if (!a || !b || !c) return 0;
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };
  const dot = ba.x * bc.x + ba.y * bc.y;
  const magBA = Math.sqrt(ba.x * ba.x + ba.y * ba.y);
  const magBC = Math.sqrt(bc.x * bc.x + bc.y * bc.y);
  if (magBA === 0 || magBC === 0) return 0;
  const cosAngle = dot / (magBA * magBC);
  const angle = Math.acos(Math.max(-1, Math.min(1, cosAngle))) * 180 / Math.PI;
  return angle;
};

const safeAngle = (a: any, b: any, c: any, name: string) => {
  try {
    const angle = calculateAngle(a, b, c);
    return isNaN(angle) ? 0 : angle;
  } catch (e) {
    console.warn(`Error calculating ${name} angle:`, e);
    return 0;
  }
};

// ===================================
// POSE DEFINITIONS & VALIDATIONS
// ===================================

// 1. TOUCH TOES POSE
// const TOUCH_TOES_POSE = {
//   name: "Touch Your Toes",
//   description: "Touch your toes with straight legs",
//   targetAngles: { leftKnee: 180, rightKnee: 180 },
//   tolerance: 15,
//   validate: (currentAngles: any) => {
//     const leftKneeScore = currentAngles.leftKnee >= 170 ? 100 : Math.max(0, 100 - Math.abs(currentAngles.leftKnee - 180) / 15 * 100);
//     const rightKneeScore = currentAngles.rightKnee >= 170 ? 100 : Math.max(0, 100 - Math.abs(currentAngles.rightKnee - 180) / 15 * 100);
//     const finalScore = Math.round((leftKneeScore + rightKneeScore) / 2);
//     return {
//       score: finalScore,
//       isMatch: finalScore >= 75,
//       feedback: finalScore >= 75 ? "Perfect stretch!" : "Keep legs straighter!"
//     };
//   }
// };

// 2. REACH RIGHT HIP POSE
const REACH_RIGHT_HIP_POSE = {
  name: "Reach Over Right Hip",
  description: "Reach your arm over your right hip",
  targetAngles: { leftHip: 150, rightHip: 115 },
  tolerance: 20,
  validate: (currentAngles: any) => {
    const leftHipScore = currentAngles.leftHip >= 150 ? 100 : Math.max(0, 100 - (150 - currentAngles.leftHip) / 20 * 100);
    const rightHipScore = currentAngles.rightHip <= 115 ? 100 : Math.max(0, 100 - (currentAngles.rightHip - 115) / 20 * 100);
    const finalScore = Math.round((leftHipScore + rightHipScore) / 2);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect stretch!" : "Bend more over your right side!"
    };
  }
};

// 3. REACH LEFT HIP POSE
const REACH_LEFT_HIP_POSE = {
  name: "Reach Over Left Hip",
  description: "Bend over your left hip",
  targetAngles: { rightHip: 150, leftHip: 115 },
  tolerance: 20,
  validate: (currentAngles: any) => {
    const rightHipScore = currentAngles.rightHip >= 150 ? 100 : Math.max(0, 100 - (150 - currentAngles.rightHip) / 20 * 100);
    const leftHipScore = currentAngles.leftHip <= 115 ? 100 : Math.max(0, 100 - (currentAngles.leftHip - 115) / 20 * 100);
    const finalScore = Math.round((rightHipScore + leftHipScore) / 2);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect stretch!" : "Bend more over your left side!"
    };
  }
};

// 4. MIDDLE SPLITS POSE
const MIDDLE_SPLITS_POSE = {
  name: "Middle Splits",
  description: "Wide leg split with straight legs",
  targetAngles: { leftHip: 90, rightHip: 90, leftKnee: 180, rightKnee: 180 },
  tolerance: 25,
  validate: (currentAngles: any) => {
    const leftHipScore = Math.max(0, 100 - Math.abs(currentAngles.leftHip - 90) / 25 * 100);
    const rightHipScore = Math.max(0, 100 - Math.abs(currentAngles.rightHip - 90) / 25 * 100);
    const leftKneeScore = Math.max(0, 100 - Math.abs(currentAngles.leftKnee - 180) / 25 * 100);
    const rightKneeScore = Math.max(0, 100 - Math.abs(currentAngles.rightKnee - 180) / 25 * 100);
    const finalScore = Math.round((leftHipScore + rightHipScore + leftKneeScore + rightKneeScore) / 4);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect splits!" : "Spread legs wider and keep them straight!"
    };
  }
};

// 5. RIGHT LUNGE POSE
// const RIGHT_LUNGE_POSE = {
//   name: "Right Lunge",
//   description: "Lunge with right leg forward",
//   targetAngles: { rightKnee: 90, leftKnee: 180, rightHip: 80, leftHip: 145 },
//   tolerance: 20,
//   validate: (currentAngles: any) => {
//     const rightKneeScore = Math.max(0, 100 - Math.abs(currentAngles.rightKnee - 90) / 20 * 100);
//     const leftKneeScore = Math.max(0, 100 - Math.abs(currentAngles.leftKnee - 180) / 20 * 100);
//     const rightHipScore = Math.max(0, 100 - Math.abs(currentAngles.rightHip - 80) / 20 * 100);
//     const leftHipScore = Math.max(0, 100 - Math.abs(currentAngles.leftHip - 145) / 20 * 100);
//     const finalScore = Math.round((rightKneeScore + leftKneeScore + rightHipScore + leftHipScore) / 4);
//     return {
//       score: finalScore,
//       isMatch: finalScore >= 75,
//       feedback: finalScore >= 75 ? "Perfect lunge!" : "Adjust your lunge position!"
//     };
//   }
// };

// 6. LEFT LUNGE POSE
// const LEFT_LUNGE_POSE = {
//   name: "Left Lunge",
//   description: "Lunge with left leg forward",
//   targetAngles: { leftKnee: 90, rightKnee: 180, leftHip: 80, rightHip: 145 },
//   tolerance: 20,
//   validate: (currentAngles: any) => {
//     const leftKneeScore = Math.max(0, 100 - Math.abs(currentAngles.leftKnee - 90) / 20 * 100);
//     const rightKneeScore = Math.max(0, 100 - Math.abs(currentAngles.rightKnee - 180) / 20 * 100);
//     const leftHipScore = Math.max(0, 100 - Math.abs(currentAngles.leftHip - 80) / 20 * 100);
//     const rightHipScore = Math.max(0, 100 - Math.abs(currentAngles.rightHip - 145) / 20 * 100);
//     const finalScore = Math.round((leftKneeScore + rightKneeScore + leftHipScore + rightHipScore) / 4);
//     return {
//       score: finalScore,
//       isMatch: finalScore >= 75,
//       feedback: finalScore >= 75 ? "Perfect lunge!" : "Adjust your lunge position!"
//     };
//   }
// };

// 7. FRONT SPLITS POSE
// const FRONT_SPLITS_POSE = {
//   name: "Front Splits",
//   description: "Front splits with straight legs",
//   targetAngles: { leftHip: 90, rightHip: 90, leftKnee: 180, rightKnee: 180 },
//   tolerance: 25,
//   validate: (currentAngles: any) => {
//     const leftHipScore = Math.max(0, 100 - Math.abs(currentAngles.leftHip - 90) / 25 * 100);
//     const rightHipScore = Math.max(0, 100 - Math.abs(currentAngles.rightHip - 90) / 25 * 100);
//     const leftKneeScore = Math.max(0, 100 - Math.abs(currentAngles.leftKnee - 180) / 25 * 100);
//     const rightKneeScore = Math.max(0, 100 - Math.abs(currentAngles.rightKnee - 180) / 25 * 100);
//     const finalScore = Math.round((leftHipScore + rightHipScore + leftKneeScore + rightKneeScore) / 4);
//     return {
//       score: finalScore,
//       isMatch: finalScore >= 75,
//       feedback: finalScore >= 75 ? "Perfect splits!" : "Get deeper into splits!"
//     };
//   }
// };

// 8. MIDDLE SPLITS LEFT REACH POSE
const MIDDLE_SPLITS_LEFT_POSE = {
  name: "Middle Splits - Reach Left",
  description: "Reach towards the left in middle splits",
  targetAngles: { leftHip: 60, rightHip: 130, leftKnee: 180, rightKnee: 180 },
  tolerance: 20,
  validate: (currentAngles: any) => {
    const leftHipScore = Math.max(0, 100 - Math.abs(currentAngles.leftHip - 60) / 20 * 100);
    const rightHipScore = Math.max(0, 100 - Math.abs(currentAngles.rightHip - 130) / 20 * 100);
    const leftKneeScore = Math.max(0, 100 - Math.abs(currentAngles.leftKnee - 180) / 20 * 100);
    const rightKneeScore = Math.max(0, 100 - Math.abs(currentAngles.rightKnee - 180) / 20 * 100);
    const finalScore = Math.round((leftHipScore + rightHipScore + leftKneeScore + rightKneeScore) / 4);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect reach!" : "Reach further to the left!"
    };
  }
};

// 9. MIDDLE SPLITS RIGHT REACH POSE
const MIDDLE_SPLITS_RIGHT_POSE = {
  name: "Middle Splits - Reach Right",
  description: "Reach towards the right in middle splits",
  targetAngles: { rightHip: 60, leftHip: 130, leftKnee: 180, rightKnee: 180 },
  tolerance: 20,
  validate: (currentAngles: any) => {
    const rightHipScore = Math.max(0, 100 - Math.abs(currentAngles.rightHip - 60) / 20 * 100);
    const leftHipScore = Math.max(0, 100 - Math.abs(currentAngles.leftHip - 130) / 20 * 100);
    const leftKneeScore = Math.max(0, 100 - Math.abs(currentAngles.leftKnee - 180) / 20 * 100);
    const rightKneeScore = Math.max(0, 100 - Math.abs(currentAngles.rightKnee - 180) / 20 * 100);
    const finalScore = Math.round((rightHipScore + leftHipScore + leftKneeScore + rightKneeScore) / 4);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect reach!" : "Reach further to the right!"
    };
  }
};

// 10. KICK LEFT LEG UP POSE
const KICK_LEFT_UP_POSE = {
  name: "Kick Left Leg Up",
  description: "Kick your left leg up high",
  targetAngles: { leftKnee: 180, rightKnee: 180, rightHip: 180, leftHip: 40 },
  tolerance: 25,
  validate: (currentAngles: any) => {
    const leftKneeScore = Math.max(0, 100 - Math.abs(currentAngles.leftKnee - 180) / 25 * 100);
    const rightKneeScore = Math.max(0, 100 - Math.abs(currentAngles.rightKnee - 180) / 25 * 100);
    const rightHipScore = Math.max(0, 100 - Math.abs(currentAngles.rightHip - 180) / 25 * 100);
    const leftHipScore = Math.max(0, 100 - Math.abs(currentAngles.leftHip - 40) / 25 * 100);
    const finalScore = Math.round((leftKneeScore + rightKneeScore + rightHipScore + leftHipScore) / 4);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect kick!" : "Kick your left leg higher!"
    };
  }
};

// 11. KICK RIGHT LEG UP POSE
const KICK_RIGHT_UP_POSE = {
  name: "Kick Right Leg Up",
  description: "Kick your right leg up high",
  targetAngles: { leftKnee: 180, rightKnee: 180, leftHip: 180, rightHip: 40 },
  tolerance: 25,
  validate: (currentAngles: any) => {
    const leftKneeScore = Math.max(0, 100 - Math.abs(currentAngles.leftKnee - 180) / 25 * 100);
    const rightKneeScore = Math.max(0, 100 - Math.abs(currentAngles.rightKnee - 180) / 25 * 100);
    const leftHipScore = Math.max(0, 100 - Math.abs(currentAngles.leftHip - 180) / 25 * 100);
    const rightHipScore = Math.max(0, 100 - Math.abs(currentAngles.rightHip - 40) / 25 * 100);
    const finalScore = Math.round((leftKneeScore + rightKneeScore + leftHipScore + rightHipScore) / 4);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect kick!" : "Kick your right leg higher!"
    };
  }
};

// 12. COBRA POSE
const COBRA_POSE = {
  name: "Cobra Pose",
  description: "Back bend cobra pose with straight arms",
  targetAngles: { spine: 25, leftHip: 120, rightHip: 120, leftElbow: 120, rightElbow: 180 },
  tolerance: 15,
  validate: (currentAngles: any) => {
    const spineScore = currentAngles.spine <= 25 ? 100 : Math.max(0, 100 - (currentAngles.spine - 25) / 15 * 100);
    const leftHipScore = currentAngles.leftHip <= 120 ? 100 : Math.max(0, 100 - (currentAngles.leftHip - 120) / 15 * 100);
    const rightHipScore = currentAngles.rightHip <= 120 ? 100 : Math.max(0, 100 - (currentAngles.rightHip - 120) / 15 * 100);
    const leftElbowScore = Math.max(0, 100 - Math.abs(currentAngles.leftElbow - 180) / 15 * 100);
    const rightElbowScore = Math.max(0, 100 - Math.abs(currentAngles.rightElbow - 180) / 15 * 100);
    const finalScore = Math.round((spineScore + leftHipScore + rightHipScore + leftElbowScore + rightElbowScore) / 5);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect cobra!" : "Arch your back more and keep arms straight!"
    };
  }
};

// 13. BUTTERFLY POSE
const BUTTERFLY_POSE = {
  name: "Butterfly Pose",
  description: "Butterfly with feet together",
  targetAngles: { leftKnee: 90, rightKnee: 90 },
  tolerance: 30,
  validate: (currentAngles: any) => {
    const leftKneeScore = currentAngles.leftKnee < 90 ? 100 : Math.max(0, 100 - (currentAngles.leftKnee - 90) / 30 * 100);
    const rightKneeScore = currentAngles.rightKnee < 90 ? 100 : Math.max(0, 100 - (currentAngles.rightKnee - 90) / 30 * 100);
    const finalScore = Math.round((leftKneeScore + rightKneeScore) / 2);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect butterfly!" : "Bring knees closer to ground!"
    };
  }
};

// 14. BUTTERFLY REACH POSE
const BUTTERFLY_REACH_POSE = {
  name: "Butterfly Reach",
  description: "Butterfly pose reaching forward",
  targetAngles: { leftKnee: 90, rightKnee: 90, leftHip: 10, rightHip: 10 },
  tolerance: 15,
  validate: (currentAngles: any) => {
    const leftKneeScore = currentAngles.leftKnee < 90 ? 100 : Math.max(0, 100 - (currentAngles.leftKnee - 90) / 15 * 100);
    const rightKneeScore = currentAngles.rightKnee < 90 ? 100 : Math.max(0, 100 - (currentAngles.rightKnee - 90) / 15 * 100);
    const leftHipScore = currentAngles.leftHip < 10 ? 100 : Math.max(0, 100 - (currentAngles.leftHip - 10) / 15 * 100);
    const rightHipScore = currentAngles.rightHip < 10 ? 100 : Math.max(0, 100 - (currentAngles.rightHip - 10) / 15 * 100);
    const finalScore = Math.round((leftKneeScore + rightKneeScore + leftHipScore + rightHipScore) / 4);
    return {
      score: finalScore,
      isMatch: finalScore >= 75,
      feedback: finalScore >= 75 ? "Perfect reach!" : "Reach forward more!"
    };
  }
};

// ===================================
// POSE COLLECTION & SEQUENCE
// ===================================
const TARGET_STRETCHES = {
  // TOUCH_TOES: TOUCH_TOES_POSE,
  REACH_RIGHT_HIP: REACH_RIGHT_HIP_POSE,
  REACH_LEFT_HIP: REACH_LEFT_HIP_POSE,
  MIDDLE_SPLITS: MIDDLE_SPLITS_POSE,
  // RIGHT_LUNGE: RIGHT_LUNGE_POSE,
  // LEFT_LUNGE: LEFT_LUNGE_POSE,
  // SPLITS: FRONT_SPLITS_POSE,
  MIDDLE_SPLITS_LEFT: MIDDLE_SPLITS_LEFT_POSE,
  MIDDLE_SPLITS_RIGHT: MIDDLE_SPLITS_RIGHT_POSE,
  KICK_LEFT_UP: KICK_LEFT_UP_POSE,
  KICK_RIGHT_UP: KICK_RIGHT_UP_POSE,
  COBRA: COBRA_POSE,
  BUTTERFLY: BUTTERFLY_POSE,
  BUTTERFLY_REACH: BUTTERFLY_REACH_POSE
};

const STRETCH_SEQUENCE = [
  'REACH_RIGHT_HIP', 'REACH_LEFT_HIP', 'MIDDLE_SPLITS','SPLITS', 'MIDDLE_SPLITS_LEFT', 'MIDDLE_SPLITS_RIGHT', 'KICK_LEFT_UP', 'KICK_RIGHT_UP', 'COBRA','BUTTERFLY', 'BUTTERFLY_REACH'
] as const;

type StretchKey = keyof typeof TARGET_STRETCHES;

// ===================================
// JOINT ANGLES EXTRACTION
// ===================================
const extractJointAngles = (landmarks: any[]) => {
  if (!landmarks || landmarks.length < 33) return null;

  return {
    // ARM ANGLES (Shoulder-Elbow-Wrist)
    leftArm: safeAngle(landmarks[LANDMARKS.LEFT_SHOULDER], landmarks[LANDMARKS.LEFT_ELBOW], landmarks[LANDMARKS.LEFT_WRIST], 'leftArm'),
    rightArm: safeAngle(landmarks[LANDMARKS.RIGHT_SHOULDER], landmarks[LANDMARKS.RIGHT_ELBOW], landmarks[LANDMARKS.RIGHT_WRIST], 'rightArm'),
    
    // SHOULDER ANGLES (Hip-Shoulder-Elbow)
    leftShoulder: safeAngle(landmarks[LANDMARKS.LEFT_HIP], landmarks[LANDMARKS.LEFT_SHOULDER], landmarks[LANDMARKS.LEFT_ELBOW], 'leftShoulder'),
    rightShoulder: safeAngle(landmarks[LANDMARKS.RIGHT_HIP], landmarks[LANDMARKS.RIGHT_SHOULDER], landmarks[LANDMARKS.RIGHT_ELBOW], 'rightShoulder'),
    
    // KNEE ANGLES (Hip-Knee-Ankle)
    leftKnee: safeAngle(landmarks[LANDMARKS.LEFT_HIP], landmarks[LANDMARKS.LEFT_KNEE], landmarks[LANDMARKS.LEFT_ANKLE], 'leftKnee'),
    rightKnee: safeAngle(landmarks[LANDMARKS.RIGHT_HIP], landmarks[LANDMARKS.RIGHT_KNEE], landmarks[LANDMARKS.RIGHT_ANKLE], 'rightKnee'),
    
    // HIP ANGLES (Shoulder-Hip-Knee)
    leftHip: safeAngle(landmarks[LANDMARKS.LEFT_SHOULDER], landmarks[LANDMARKS.LEFT_HIP], landmarks[LANDMARKS.LEFT_KNEE], 'leftHip'),
    rightHip: safeAngle(landmarks[LANDMARKS.RIGHT_SHOULDER], landmarks[LANDMARKS.RIGHT_HIP], landmarks[LANDMARKS.RIGHT_KNEE], 'rightHip'),
    
    // ANKLE ANGLES (Knee-Ankle-Heel)
    leftAnkle: safeAngle(landmarks[LANDMARKS.LEFT_KNEE], landmarks[LANDMARKS.LEFT_ANKLE], landmarks[LANDMARKS.LEFT_HEEL], 'leftAnkle'),
    rightAnkle: safeAngle(landmarks[LANDMARKS.RIGHT_KNEE], landmarks[LANDMARKS.RIGHT_ANKLE], landmarks[LANDMARKS.RIGHT_HEEL], 'rightAnkle'),
    
    // Additional angles for comprehensive tracking
    leftFoot: safeAngle(landmarks[LANDMARKS.LEFT_ANKLE], landmarks[LANDMARKS.LEFT_HEEL], landmarks[LANDMARKS.LEFT_FOOT_INDEX], 'leftFoot'),
    rightFoot: safeAngle(landmarks[LANDMARKS.RIGHT_ANKLE], landmarks[LANDMARKS.RIGHT_HEEL], landmarks[LANDMARKS.RIGHT_FOOT_INDEX], 'rightFoot'),
    leftWrist: safeAngle(landmarks[LANDMARKS.LEFT_ELBOW], landmarks[LANDMARKS.LEFT_WRIST], landmarks[LANDMARKS.LEFT_INDEX], 'leftWrist'),
    rightWrist: safeAngle(landmarks[LANDMARKS.RIGHT_ELBOW], landmarks[LANDMARKS.RIGHT_WRIST], landmarks[LANDMARKS.RIGHT_INDEX], 'rightWrist'),
    neckTilt: safeAngle(landmarks[LANDMARKS.LEFT_SHOULDER], landmarks[LANDMARKS.RIGHT_SHOULDER], landmarks[LANDMARKS.NOSE], 'neckTilt'),
    headTilt: safeAngle(landmarks[LANDMARKS.LEFT_EAR], landmarks[LANDMARKS.NOSE], landmarks[LANDMARKS.RIGHT_EAR], 'headTilt'),
    torsoLean: safeAngle(landmarks[LANDMARKS.LEFT_SHOULDER], { 
      x: (landmarks[LANDMARKS.LEFT_HIP].x + landmarks[LANDMARKS.RIGHT_HIP].x) / 2,
      y: (landmarks[LANDMARKS.LEFT_HIP].y + landmarks[LANDMARKS.RIGHT_HIP].y) / 2
    }, landmarks[LANDMARKS.RIGHT_SHOULDER], 'torsoLean'),
    spine: Math.abs(landmarks[LANDMARKS.LEFT_SHOULDER].x - landmarks[LANDMARKS.LEFT_HIP].x) * 180,
    shoulderBalance: Math.abs(landmarks[LANDMARKS.LEFT_SHOULDER].y - landmarks[LANDMARKS.RIGHT_SHOULDER].y) * 180,
    hipBalance: Math.abs(landmarks[LANDMARKS.LEFT_HIP].y - landmarks[LANDMARKS.RIGHT_HIP].y) * 180,
  };
};

// ===================================
// POSE VALIDATION FUNCTION
// ===================================
const validatePose = (currentAngles: any, targetStretch: any) => {
  if (!currentAngles || !targetStretch) {
    return { score: 0, isMatch: false, feedback: "No pose detected" };
  }

  // Use the pose's built-in validation function
  return targetStretch.validate(currentAngles);
};

// ===================================
// DRAWING FUNCTION
// ===================================
const drawPoseWithAngles = (ctx: CanvasRenderingContext2D, landmarks: any[], validation: any) => {
  const width = ctx.canvas.width;
  const height = ctx.canvas.height;
  
  ctx.clearRect(0, 0, width, height);
  
  // Draw skeleton connections
  const connections = [
    [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_ELBOW], [LANDMARKS.LEFT_ELBOW, LANDMARKS.LEFT_WRIST],
    [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_ELBOW], [LANDMARKS.RIGHT_ELBOW, LANDMARKS.RIGHT_WRIST],
    [LANDMARKS.LEFT_SHOULDER, LANDMARKS.RIGHT_SHOULDER],
    [LANDMARKS.LEFT_SHOULDER, LANDMARKS.LEFT_HIP], [LANDMARKS.RIGHT_SHOULDER, LANDMARKS.RIGHT_HIP],
    [LANDMARKS.LEFT_HIP, LANDMARKS.RIGHT_HIP],
    [LANDMARKS.LEFT_HIP, LANDMARKS.LEFT_KNEE], [LANDMARKS.LEFT_KNEE, LANDMARKS.LEFT_ANKLE],
    [LANDMARKS.RIGHT_HIP, LANDMARKS.RIGHT_KNEE], [LANDMARKS.RIGHT_KNEE, LANDMARKS.RIGHT_ANKLE]
  ];
  
  // Draw connections with validation-based coloring
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
  
  // Draw key landmarks
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

// ===================================
// MAIN COMPONENT
// ===================================
interface PoseCameraProps {
  onPoseMatch?: (isMatch: boolean, score: number, currentStretch: string, isComplete: boolean) => void;
  showDebug?: boolean;
  score?: number;
}

const PoseCamera: React.FC<PoseCameraProps> = ({ 
  targetStretch,
  onPoseMatch,
  showDebug = true,
  score = 0
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
      alert('🎉 Congratulations! You completed all stretches! 🎉');
    }
  };

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

      {/* Score Display with Next Button */}
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
        <div style={{ fontSize: 28, color: '#ff69b4', fontWeight: 900, marginBottom: 8 }}>
          Score: {score}
        </div>
        <div style={{ color: "#00FF00", fontSize: "18px", marginBottom: "8px" }}>
          Stretch {currentStretchIndex + 1} of {STRETCH_SEQUENCE.length}
        </div>
        <div style={{ color: poseValidation?.isMatch ? "#00FF00" : "#FF6600", marginBottom: "5px" }}>
          Score: {poseValidation?.score || 0}%
        </div>
        <div style={{ fontSize: "14px", marginTop: "5px", color: "#CCCCCC" }}>
          {poseValidation?.feedback || "Get into position"}
        </div>
        
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
            <div>Left Hip: {Math.round(currentAngles.leftHip)}° (target: {currentStretch?.targetAngles.leftHip || 'N/A'}°)</div>
            <div>Right Hip: {Math.round(currentAngles.rightHip)}° (target: {currentStretch?.targetAngles.rightHip || 'N/A'}°)</div>
            <div>Left Knee: {Math.round(currentAngles.leftKnee)}° (target: {currentStretch?.targetAngles.leftKnee || 'N/A'}°)</div>
            <div>Right Knee: {Math.round(currentAngles.rightKnee)}° (target: {currentStretch?.targetAngles.rightKnee || 'N/A'}°)</div>
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
            <div>Spine Bend: {Math.round(currentAngles.spine)}° (target: {currentStretch?.targetAngles.spine || 'N/A'}°)</div>
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