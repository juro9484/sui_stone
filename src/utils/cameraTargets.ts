import { Vector3, Euler, MathUtils } from 'three';

// Helper function to convert degrees to radians
const degToRad = MathUtils.degToRad;

export interface CameraTarget {
  // Identifier for the target (matched with object names or userData properties)
  targetId: string;
  
  // Position the camera should move to
  position: Vector3;
  
  // Rotation in Euler angles (radians)
  rotation: Euler;
  
  // Optional duration for the animation (ms)
  duration?: number;
}

// Define all camera targets in the application
export const CAMERA_TARGETS: Record<string, CameraTarget> = {
  // Wordle portal target
  wordle: {
    targetId: "wordle-portal",
    position: new Vector3(-9.49, 5.67, 2.7),
    rotation: new Euler(
      degToRad(-79.4),  // X rotation
      degToRad(-83.8),  // Y rotation
      degToRad(-79.3)   // Z rotation
    ),
    duration: 1000
  },
  
  // Default target - wide view of scene
  default: {
    targetId: "default-view",
    position: new Vector3(10, 20, 40),
    rotation: new Euler(0, 0, 0),
    duration: 1500
  },
  
  // You can add more targets here as needed
};

// Function to find a target by object name or userData
export function findTargetByObject(objectName: string, userData?: any): CameraTarget | null {
  // Map of object identifiers to target keys
  const objectToTargetMap: Record<string, string> = {
    "pCube11_THREE_0": "wordle",
    "wordle-portal": "wordle",
    // Add more mappings as needed
  };
  
  // Check if this object has a mapping
  const targetKey = objectToTargetMap[objectName];
  if (targetKey && CAMERA_TARGETS[targetKey]) {
    return CAMERA_TARGETS[targetKey];
  }
  
  // Also check userData if provided
  if (userData?.targetCamera) {
    return CAMERA_TARGETS[userData.targetCamera];
  }
  
  return null;
}