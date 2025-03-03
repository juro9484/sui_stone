import React, { useRef } from 'react';
import { StyleSheet, View, Text, Platform } from 'react-native';
import { Canvas } from '@react-three/fiber/native';
// import * as THREE from 'three';
// import { useThemeColor } from '@/hooks/useThemeColor';

// function Box(props: any) {
//   // This reference gives us direct access to the THREE.Mesh object
//   const meshRef = useRef<THREE.Mesh>(null);
  
//   // Rotate mesh every frame, this is outside of React without overhead
//   useFrame((state, delta) => {
//     if (meshRef.current) {
//       meshRef.current.rotation.x += delta * 0.5;
//       meshRef.current.rotation.y += delta * 0.5;
//     }
//   });

//   return (
//     <mesh
//       {...props}
//       ref={meshRef}
//       scale={1.5}>
//       <boxGeometry args={[1, 1, 1]} />
//       <meshStandardMaterial color={'#0088cc'} />
//     </mesh>
//   );
// }

export function Experience3D() {
  // const backgroundColor = useThemeColor({}, 'background');
  
  return (
    <View style={[styles.container]}>
      {/* <Canvas
        gl={{ preserveDrawingBuffer: true }} // Important for Android
        style={styles.canvas}
      >
        <ambientLight intensity={0.8} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <Box position={[0, 0, 0]} />
      </Canvas> */}
      <Canvas camera={{ position: [-2, 2.5, 5], fov: 30}}>
        <color attach="background" args={["#512DA8"]} />
        <mesh>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color="hotpink" />
        </mesh>
      </Canvas>
      <Text>Hello World!</Text>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    // width: '100%',
    // height: 250,
    // marginBottom: 20
    // height: 150,
    width: '100%',
    flex: 1
    // alignItems: 'center',
    // justifyContent: 'center'
  }
});