"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { StarsParams } from "@/lib/types";

function colorForTemp(t: number): THREE.Color {
  // t=0 -> cool blue-white, t=1 -> hot orange-red
  const cool = new THREE.Color(0x9db4ff);
  const hot = new THREE.Color(0xffb877);
  return cool.clone().lerp(hot, t);
}

export default function StarField({ params }: { params: StarsParams }) {
  const pointsRef = useRef<THREE.Points>(null);
  const materialRef = useRef<THREE.PointsMaterial>(null);

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(params.count * 3);
    const colors = new Float32Array(params.count * 3);
    const sizes = new Float32Array(params.count);
    const base = colorForTemp(params.colorTemp);

    for (let i = 0; i < params.count; i++) {
      const r = params.spread * (0.3 + 0.7 * Math.random());
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      const flicker = 0.7 + Math.random() * 0.3;
      const c = base.clone().multiplyScalar(flicker);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = Math.random() * 1.6 + 0.4;
    }

    return { positions, colors, sizes };
  }, [params.count, params.spread, params.colorTemp]);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y += 0.00025;
    }
    if (materialRef.current) {
      const t = state.clock.getElapsedTime();
      materialRef.current.opacity =
        0.75 + Math.sin(t * params.twinkleSpeed) * 0.15;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
        <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        ref={materialRef}
        size={0.06}
        vertexColors
        sizeAttenuation
        transparent
        opacity={0.9}
        depthWrite={false}
      />
    </points>
  );
}
