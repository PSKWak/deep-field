"use client";

import { useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";

export default function Sun() {
  const meshRef = useRef<THREE.Mesh>(null);
  const texture = useLoader(THREE.TextureLoader, "/textures/planets/2k_sun.jpg");

  useFrame((_, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group>
      <pointLight position={[0, 0, 0]} intensity={80} distance={200} decay={1.2} />
      <mesh ref={meshRef}>
        <sphereGeometry args={[2, 48, 48]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </group>
  );
}
