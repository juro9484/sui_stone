import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function Box(props: any) {
  // This reference gives us direct access to the THREE.Mesh object
  const meshRef = useRef<THREE.Mesh>(null);
  
  // Rotate mesh every frame, this is outside of React without overhead
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.5;
      meshRef.current.rotation.y += delta * 0.5;
    }
  });

  return (
    <mesh
      {...props}
      ref={meshRef}
      scale={1.5}>
      <boxGeometry args={[1, 1, 1]} />
      <meshStandardMaterial color={'#0088cc'} />
    </mesh>
  );
}

const Experience: React.FC = () => {
  return (
    <div className="w-full h-64 mb-8">
      <Canvas>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <Box position={[0, 0, 0]} />
      </Canvas>
    </div>
  );
};

export default Experience;