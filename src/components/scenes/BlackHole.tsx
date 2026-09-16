"use client";

import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import type { BlackHoleParams } from "@/lib/types";

function diskColor(temp: number, falloff: number): THREE.Color {
  // falloff: 0 near horizon (hottest/whitest), 1 at outer edge (cooler)
  const hot = new THREE.Color().setHSL(0.14 - temp * 0.1, 1, 0.75); // white-yellow
  const cool = new THREE.Color().setHSL(0.62 - temp * 0.25, 0.9, 0.45); // blue/orange
  return hot.clone().lerp(cool, falloff);
}

export default function BlackHole({ params }: { params: BlackHoleParams }) {
  const diskRef = useRef<THREE.Points>(null);
  const ringRef = useRef<THREE.Mesh>(null);

  const particleCount = Math.round(200 * params.diskDensity + 400);

  const { positions, colors, sizes } = useMemo(() => {
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);

    const inner = params.horizonSize * 1.6;
    const outer = params.horizonSize * 5.5;

    for (let i = 0; i < particleCount; i++) {
      const r = inner + Math.pow(Math.random(), 1.5) * (outer - inner);
      const angle = Math.random() * Math.PI * 2;
      const thickness = (Math.random() - 0.5) * 0.15 * (r / outer);

      positions[i * 3] = Math.cos(angle) * r;
      positions[i * 3 + 1] = thickness;
      positions[i * 3 + 2] = Math.sin(angle) * r;

      const falloff = (r - inner) / (outer - inner);
      const c = diskColor(params.diskTemp, falloff);
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      sizes[i] = (1 - falloff) * 1.6 + 0.3;
    }

    return { positions, colors, sizes };
  }, [particleCount, params.horizonSize, params.diskTemp]);

  useFrame((_, delta) => {
    if (diskRef.current) {
      diskRef.current.rotation.y += delta * 0.4 * params.spinSpeed;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z += delta * 0.15 * params.spinSpeed;
    }
  });

  return (
    <group>
      {/* event horizon */}
      <mesh>
        <sphereGeometry args={[params.horizonSize, 48, 48]} />
        <meshBasicMaterial color="#000000" />
      </mesh>

      {/* photon ring glow */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[params.horizonSize * 1.15, 0.03, 16, 100]} />
        <meshBasicMaterial
          color={diskColor(params.diskTemp, 0).getHex()}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* accretion disk */}
      <points ref={diskRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            args={[positions, 3]}
          />
          <bufferAttribute attach="attributes-color" args={[colors, 3]} />
          <bufferAttribute attach="attributes-size" args={[sizes, 1]} />
        </bufferGeometry>
        <pointsMaterial
          size={0.08}
          vertexColors
          sizeAttenuation
          transparent
          opacity={0.95}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>
    </group>
  );
}
