import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense, useRef, useCallback } from 'react';
import React from 'react';
import { Scene } from './components/Scene';
import { Vector3, Object3D, Camera, Euler, MathUtils } from 'three';

// Create a wrapper for the Scene component to handle clicks
function InteractiveScene({ onCubeClick }: { onCubeClick: () => void }) {
  // We'll use the existing Scene component and add a click handler via event bubbling
  const handleSceneClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    // Check if the clicked object is the specific mesh we tagged in the Scene component
    if (event.object.name === "pCube11_THREE_0" || event.object.userData?.clickable) {
      // Found our target object, trigger the camera position change
      onCubeClick();
      event.stopPropagation();
    }
  }, [onCubeClick]);
  
  return (
    <group onClick={handleSceneClick}>
      <Scene />
    </group>
  );
}

export default function Experience() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<Camera>();
  const targetPositionRef = useRef<Vector3 | null>(null);
  const animationDurationRef = useRef(1000); // Animation duration in ms
  const startTimeRef = useRef(0);
  
  // Store the initial camera position and rotation for animation
  const startPositionRef = useRef<Vector3 | null>(null);
  const startRotationRef = useRef<Euler | null>(null);
  const targetRotationRef = useRef<Euler | null>(null);
  
  const handleCubeClick = useCallback(() => {
    if (cameraRef.current) {
      // Set the target position and rotation for smooth animation
      startPositionRef.current = new Vector3().copy(cameraRef.current.position);
      targetPositionRef.current = new Vector3(-9.66, 5.75, 2.64);
      
      // Store initial rotation
      startRotationRef.current = new Euler().copy(cameraRef.current.rotation);
      
      // Set target rotation in radians (-90, -90, 90 degrees)
      const degToRad = MathUtils.degToRad;
      targetRotationRef.current = new Euler(
        degToRad(-90),  // X rotation
        degToRad(-90),  // Y rotation
        degToRad(-90)    // Z rotation
      );
      
      // Start animation
      startTimeRef.current = Date.now();
    }
  }, []);
  
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div 
        ref={overlayRef} 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          color: 'white',
          padding: '8px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          lineHeight: '1.5',
          pointerEvents: 'none',
          width: 'auto',
          minWidth: '200px'
        }} 
        id="camera-position-display"
      >
        Camera: Loading...
      </div>
      
      <Canvas camera={{ position: [10, 20, 40], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <InteractiveScene onCubeClick={handleCubeClick} />
          <OrbitControls />
          <CameraUpdater 
            overlayRef={overlayRef} 
            cameraRef={cameraRef} 
            targetPositionRef={targetPositionRef}
            startPositionRef={startPositionRef}
            startRotationRef={startRotationRef}
            targetRotationRef={targetRotationRef}
            startTimeRef={startTimeRef}
            animationDurationRef={animationDurationRef}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

type CameraUpdaterProps = {
  overlayRef: React.RefObject<HTMLDivElement>;
  cameraRef: React.MutableRefObject<Camera | undefined>;
  targetPositionRef: React.MutableRefObject<Vector3 | null>;
  startPositionRef: React.MutableRefObject<Vector3 | null>;
  startRotationRef: React.MutableRefObject<Euler | null>;
  targetRotationRef: React.MutableRefObject<Euler | null>;
  startTimeRef: React.MutableRefObject<number>;
  animationDurationRef: React.MutableRefObject<number>;
};

function CameraUpdater({ 
  overlayRef, 
  cameraRef, 
  targetPositionRef, 
  startPositionRef,
  startRotationRef,
  targetRotationRef,
  startTimeRef, 
  animationDurationRef 
}: CameraUpdaterProps) {
  const { camera } = useThree();
  
  // Store camera reference
  cameraRef.current = camera;
  
  useFrame(() => {
    // Update position and rotation display
    if (overlayRef.current) {
      // Position with 2 decimal places
      const x = Math.round(camera.position.x * 100) / 100;
      const y = Math.round(camera.position.y * 100) / 100;
      const z = Math.round(camera.position.z * 100) / 100;
      
      // Rotation in degrees with 1 decimal place
      const rotX = Math.round(camera.rotation.x * 180 / Math.PI * 10) / 10;
      const rotY = Math.round(camera.rotation.y * 180 / Math.PI * 10) / 10;
      const rotZ = Math.round(camera.rotation.z * 180 / Math.PI * 10) / 10;
      
      overlayRef.current.innerHTML = `Position: [${x}, ${y}, ${z}]<br>Rotation: [${rotX}°, ${rotY}°, ${rotZ}°]`;
    }
    
    // Handle smooth camera animation if a target position and rotation are set
    if (targetPositionRef.current && startPositionRef.current && 
        targetRotationRef.current && startRotationRef.current) {
      const elapsed = Date.now() - startTimeRef.current;
      const progress = Math.min(elapsed / animationDurationRef.current, 1);
      
      if (progress < 1) {
        // Apply easing function for smoother animation (ease-out cubic)
        const t = 1 - Math.pow(1 - progress, 3);
        
        // Interpolate between start position and target position
        camera.position.lerpVectors(
          startPositionRef.current,
          targetPositionRef.current,
          t
        );
        
        // Interpolate between start rotation and target rotation
        // For each axis (x, y, z)
        camera.rotation.x = startRotationRef.current.x + 
          (targetRotationRef.current.x - startRotationRef.current.x) * t;
          
        camera.rotation.y = startRotationRef.current.y + 
          (targetRotationRef.current.y - startRotationRef.current.y) * t;
          
        camera.rotation.z = startRotationRef.current.z + 
          (targetRotationRef.current.z - startRotationRef.current.z) * t;
      } else {
        // Animation complete, set final position and rotation, then clear targets
        camera.position.copy(targetPositionRef.current);
        camera.rotation.copy(targetRotationRef.current);
        
        // Clear all references
        targetPositionRef.current = null;
        startPositionRef.current = null;
        targetRotationRef.current = null;
        startRotationRef.current = null;
      }
    }
  });
  
  return null;
}