import React from 'react';
import { Html } from '@react-three/drei';
import Wordle from '../pages/Wordle';

const WordlePortal: React.FC = () => {
  return (
    <mesh 
      position={[-8.2, 5.75, 2.64]} 
      rotation={[0, Math.PI / 2, 0]}
      name="wordle-portal"
      userData={{ targetCamera: "wordle" }}
    >
      <planeGeometry args={[5, 4]} />
      <meshBasicMaterial color="#1f2937" opacity={0} transparent />
      <Html
        transform
        rotation-x={10 * Math.PI / 365}
        rotation-y={Math.PI}
        position={[0, -.2, 0]}
        style={{
          width: '600px',
          height: '500px',
          backgroundColor: 'transparent',
          overflow: 'hidden',
          transform: 'scale(0.8)',
          transformOrigin: 'center center'
        }}
        distanceFactor={1}
        occlude
      >
        <div style={{ 
          width: '100%', 
          height: '100%', 
          overflow: 'auto',
          padding: '10px',
          boxSizing: 'border-box',
          backgroundColor: 'transparent'
        }}>
          <Wordle username="player" goBackHome={() => {}} />
        </div>
      </Html>
    </mesh>
  );
};

export default WordlePortal;