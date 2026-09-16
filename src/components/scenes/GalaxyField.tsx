"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { GalaxiesParams } from "@/lib/types";

const INNER_COLOR = new THREE.Color(0xffd9a0);
const OUTER_COLOR = new THREE.Color(0x6f8cff);

export default function GalaxyField({ params }: { params: GalaxiesParams }) {
  const groupRef = useRef<THREE.Points>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(params.particles * 3);
    const colors = new Float32Array(params.particles * 3);
    const radius = 9;

    for (let i = 0; i < params.particles; i++) {
      const r = Math.pow(Math.random(), 0.6) * radius;
      const armIndex = i % params.armCount;
      const armAngleOffset = (armIndex / params.armCount) * Math.PI * 2;
      const spin = r * params.armTightness;
      const randomAngle = (Math.random() - 0.5) * 0.5;
      const angle = armAngleOffset + spin + randomAngle;

      const spread = (Math.random() - 0.5) * 0.6 * (1 - r / radius + 0.15);

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = spread * 1.2;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      const mixed = INNER_COLOR.clone().lerp(OUTER_COLOR, r / radius);
      colors[i * 3] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    return { positions, colors };
  }, [params.particles, params.armCount, params.armTightness]);

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05 * params.spinSpeed;
    }
  });

  return (
    <points ref={groupRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.85}
        depthWrite={false}
      />
    </points>
  );
}
