import { Canvas, useThree, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';
import { Suspense, useRef, useCallback, useState, useEffect } from 'react';
import React from 'react';
import { Scene } from './components/Scene';
import { Camera } from 'three';
import WordlePortal from './components/WordlePortal';
import WalletConnect from './components/WalletConnect';
import { CameraController } from './utils/cameraController';
import { findTargetByObject, CAMERA_TARGETS } from './utils/cameraTargets';


// Create a wrapper for the Scene component to handle clicks
function InteractiveScene({ onObjectClick }: { onObjectClick: (event: ThreeEvent<MouseEvent>) => void }) {
  return (
    <group onClick={onObjectClick}>
      <Scene />
      <WordlePortal />
    </group>
  );
}

export default function Experience() {
  const overlayRef = useRef<HTMLDivElement>(null);
  const cameraControllerRef = useRef<CameraController | null>(null);
  const cameraRef = useRef<Camera>();
  
  // State to toggle OrbitControls on/off
  const [orbitControlsEnabled, setOrbitControlsEnabled] = useState(true);
  
  // Handle object click and move camera to appropriate target
  const handleObjectClick = useCallback((event: ThreeEvent<MouseEvent>) => {
    // Find if the clicked object has an associated camera target
    const target = findTargetByObject(
      event.object.name, 
      event.object.userData
    );
    
    // If we found a target and have a camera controller, move to that target
    if (target && cameraControllerRef.current) {
      cameraControllerRef.current.moveToTarget(target);
      event.stopPropagation();
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
      
      <div 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          right: '10px', 
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          padding: '8px',
          borderRadius: '4px',
        }} 
      >
        <WalletConnect />
      </div>
      
      {!orbitControlsEnabled && (
        <button
          onClick={() => {
            if (cameraControllerRef.current) {
              // Move to the default view target
              cameraControllerRef.current.moveToTarget(CAMERA_TARGETS.default);
              // Enable orbit controls after camera moves to position
              setTimeout(() => {
                if (cameraControllerRef.current) {
                  cameraControllerRef.current.enableOrbitControls();
                }
              }, CAMERA_TARGETS.default.duration || 0);
            }
          }}
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '20px',
            zIndex: 100,
            padding: '10px 15px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          Back to Overview
        </button>
      )}
      
      <Canvas camera={{ position: [10, 20, 40], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <InteractiveScene onObjectClick={handleObjectClick} />
          {orbitControlsEnabled && <OrbitControls />}
          <CameraUpdater 
            overlayRef={overlayRef} 
            cameraRef={cameraRef}
            cameraControllerRef={cameraControllerRef}
            setOrbitControlsEnabled={setOrbitControlsEnabled}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}

type CameraUpdaterProps = {
  overlayRef: React.RefObject<HTMLDivElement>;
  cameraRef: React.MutableRefObject<Camera | undefined>;
  cameraControllerRef: React.MutableRefObject<CameraController | null>;
  setOrbitControlsEnabled: React.Dispatch<React.SetStateAction<boolean>>;
};

function CameraUpdater({ 
  overlayRef, 
  cameraRef,
  cameraControllerRef,
  setOrbitControlsEnabled
}: CameraUpdaterProps) {
  const { camera } = useThree();
  
  // Store camera reference
  cameraRef.current = camera;
  
  // Initialize camera controller
  useEffect(() => {
    if (camera) {
      cameraControllerRef.current = new CameraController(
        camera,
        setOrbitControlsEnabled
      );
    }
  }, [camera, setOrbitControlsEnabled]);
  
  useFrame(() => {
    // Update camera controller
    if (cameraControllerRef.current) {
      // Apply constraints to camera position
      cameraControllerRef.current.applyConstraints(-40, 40, -10, 40, -40, 40);
      
      // Update animation
      cameraControllerRef.current.update();
    }

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
  });
  
  return null;
}