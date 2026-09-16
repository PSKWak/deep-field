"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export type GravityParticleSpawn = {
  id: number;
  position: THREE.Vector3;
  velocity: THREE.Vector3;
};

type GravityParticleProps = {
  spawn: GravityParticleSpawn;
  horizonSize: number;
  gravityStrength: number;
  onDone: (id: number) => void;
};

const G = 45;
const MAX_TRAIL = 14;

export default function GravityParticle({
  spawn,
  horizonSize,
  gravityStrength,
  onDone,
}: GravityParticleProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const position = useRef(spawn.position.clone());
  const velocity = useRef(spawn.velocity.clone());
  const age = useRef(0);
  const state = useRef<"falling" | "consumed">("falling");
  const consumedAt = useRef(0);
  const history = useRef<THREE.Vector3[]>([]);

  const trailPositions = useRef(new Float32Array(MAX_TRAIL * 3));
  const line = useMemo(() => {
    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute(
      "position",
      new THREE.BufferAttribute(trailPositions.current, 3)
    );
    geometry.setDrawRange(0, 0);
    const material = new THREE.LineBasicMaterial({
      color: "#7dd3fc",
      transparent: true,
      opacity: 0.5,
    });
    const obj = new THREE.Line(geometry, material);
    obj.frustumCulled = false;
    return obj;
  }, []);

  useEffect(() => {
    return () => {
      line.geometry.dispose();
      (line.material as THREE.Material).dispose();
    };
  }, [line]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, 0.05);
    const mesh = meshRef.current;
    if (!mesh) return;

    age.current += delta;

    if (state.current === "consumed") {
      const t = age.current - consumedAt.current;
      const shrink = Math.max(0, 1 - t / 0.4);
      mesh.scale.setScalar(shrink * 0.4);
      if (t > 0.4) onDone(spawn.id);
      return;
    }

    const r = position.current.length();

    if (r < horizonSize * 0.98) {
      state.current = "consumed";
      consumedAt.current = age.current;
      return;
    }

    // Newtonian-ish inverse-square pull toward the singularity at the origin.
    const accelMag = (G * gravityStrength) / (r * r);
    const toCenter = position.current.clone().negate().normalize();
    velocity.current.addScaledVector(toCenter, accelMag * delta);
    position.current.addScaledVector(velocity.current, delta);

    mesh.position.copy(position.current);

    // Spaghettification: stretch radially as the particle nears the horizon.
    const proximity = THREE.MathUtils.clamp(
      1 - (r - horizonSize) / (horizonSize * 2.5),
      0,
      1
    );
    const stretch = 1 + proximity * proximity * 6;
    const thin = (1 / Math.sqrt(stretch)) * 0.9;
    mesh.scale.set(thin, thin, stretch * 0.9);
    mesh.lookAt(0, 0, 0);

    // trail: keep the last few positions and rewrite the line geometry
    history.current.unshift(position.current.clone());
    if (history.current.length > MAX_TRAIL) history.current.pop();
    const arr = trailPositions.current;
    for (let i = 0; i < history.current.length; i++) {
      const p = history.current[i];
      arr[i * 3] = p.x;
      arr[i * 3 + 1] = p.y;
      arr[i * 3 + 2] = p.z;
    }
    const geom = line.geometry;
    geom.setDrawRange(0, history.current.length);
    (geom.attributes.position as THREE.BufferAttribute).needsUpdate = true;

    if (r > 70 || age.current > 30) {
      onDone(spawn.id);
    }
  });

  return (
    <>
      <primitive object={line} />
      <mesh ref={meshRef} position={spawn.position}>
        <sphereGeometry args={[0.14, 12, 12]} />
        <meshBasicMaterial color="#bae6fd" />
      </mesh>
    </>
  );
}
