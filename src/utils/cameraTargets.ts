import { Vector3, Euler, MathUtils } from 'three';

// Helper function to convert degrees to radians
const degToRad = MathUtils.degToRad;

// Single camera position and rotation target
export interface CameraPosition {
  position: Vector3;
  rotation: Euler;
  duration: number;
}

// Main camera target interface
export interface CameraTarget {
  // Identifier for the target (matched with object names or userData properties)
  targetId: string;
  
  // Primary target position (used when sequence is not available)
  position: Vector3;
  
  // Primary target rotation (used when sequence is not available)
  rotation: Euler;
  
  // Optional duration for single animation (ms)
  duration?: number;
  
  // Optional sequence of positions to visit in order
  sequence?: CameraPosition[];
  
  // Optional callback to execute when target is reached
  onComplete?: () => void;
}

// Define all camera targets in the application
export const CAMERA_TARGETS: Record<string, CameraTarget> = {
  // Wordle portal target with sequence
  wordle: {
    targetId: "wordle-portal",
    // Default values (used if sequence unavailable)
    position: new Vector3(-9.49, 5.67, 2.7),
    rotation: new Euler(
      degToRad(-79.4),  // X rotation
      degToRad(-83.8),  // Y rotation
      degToRad(-79.3)   // Z rotation
    ),
    // Sequence of positions for multi-stage camera movement
    sequence: [
      {
        // First position - moving towards the portal
        position: new Vector3(-18.86, 6.81, 2.7),
        rotation: new Euler(
          degToRad(-85.1),
          degToRad(-79.5),
          degToRad(-85.1)
        ),
        duration: 1500
      },
      {
        // Final position - direct view of portal
        position: new Vector3(-9.49, 5.67, 2.7),
        rotation: new Euler(
          degToRad(-79.4),
          degToRad(-83.8),
          degToRad(-79.3)
        ),
        duration: 1000
      }
    ]
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