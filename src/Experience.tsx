import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Suspense, useRef } from 'react';
import React from 'react';
import { Scene } from './components/Scene';

// This component is not used, so we can remove it

export default function Experience() {
  const overlayRef = useRef<HTMLDivElement>(null);

  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative' }}>
      <div 
        ref={overlayRef} 
        style={{ 
          position: 'absolute', 
          top: '10px', 
          left: '10px', 
          zIndex: 100,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          color: 'white',
          padding: '5px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          pointerEvents: 'none'
        }} 
        id="camera-position-display"
      >
        Camera: Loading...
      </div>
      
      <Canvas camera={{ position: [10, 20, 40], fov: 45 }}>
        <Suspense fallback={null}>
          <Environment preset="sunset" />
          <Scene />
          <OrbitControls />
          <CameraUpdater overlayRef={overlayRef} />
        </Suspense>
      </Canvas>
    </div>
  );
}

type CameraUpdaterProps = {
  overlayRef: React.RefObject<HTMLDivElement>;
};

function CameraUpdater({ overlayRef }: CameraUpdaterProps) {
  const { camera } = useThree();
  
  useFrame(() => {
    if (overlayRef.current) {
      const x = Math.round(camera.position.x * 100) / 100;
      const y = Math.round(camera.position.y * 100) / 100;
      const z = Math.round(camera.position.z * 100) / 100;
      overlayRef.current.innerHTML = `Camera: [${x}, ${y}, ${z}]`;
    }
  });
  
  return null;
}