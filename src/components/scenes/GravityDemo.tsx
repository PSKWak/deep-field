"use client";

import { useRef, useState } from "react";
import type { ThreeEvent } from "@react-three/fiber";
import * as THREE from "three";
import GravityParticle, { type GravityParticleSpawn } from "./GravityParticle";

type GravityDemoProps = {
  horizonSize: number;
  gravityStrength: number;
  particleSpin: number;
};

const MAX_PARTICLES = 25;

export default function GravityDemo({
  horizonSize,
  gravityStrength,
  particleSpin,
}: GravityDemoProps) {
  const [particles, setParticles] = useState<GravityParticleSpawn[]>([]);
  const nextId = useRef(0);

  const spawnAt = (point: THREE.Vector3) => {
    const r = Math.hypot(point.x, point.z) || 1;
    // circular-orbit speed under our G, scaled by the user's spin slider
    const circularSpeed = Math.sqrt((45 * gravityStrength) / r);
    const tangent = new THREE.Vector3(-point.z, 0, point.x).normalize();
    const velocity = tangent.multiplyScalar(circularSpeed * particleSpin);

    const id = nextId.current++;
    setParticles((prev) => {
      const next = [...prev, { id, position: point.clone(), velocity }];
      return next.length > MAX_PARTICLES ? next.slice(next.length - MAX_PARTICLES) : next;
    });
  };

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    spawnAt(e.point);
  };

  const removeParticle = (id: number) => {
    setParticles((prev) => prev.filter((p) => p.id !== id));
  };

  return (
    <group>
      {/* invisible spawn plane: click anywhere near the disk to drop a particle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} onClick={handleClick}>
        <planeGeometry args={[90, 90]} />
        <meshBasicMaterial transparent opacity={0} depthWrite={false} />
      </mesh>

      {particles.map((p) => (
        <GravityParticle
          key={p.id}
          spawn={p}
          horizonSize={horizonSize}
          gravityStrength={gravityStrength}
          onDone={removeParticle}
        />
      ))}
    </group>
  );
}
