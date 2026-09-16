"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetData } from "@/lib/planets";
import { SIM_EPOCH_MS, sceneDistance, sceneRadius } from "@/lib/planets";

type PlanetProps = {
  planet: PlanetData;
  startAngle: number;
  simTimeRef: React.RefObject<number>;
  positions: Map<string, THREE.Vector3>;
  selected: boolean;
  onSelect: (planet: PlanetData) => void;
  onHover: (planet: PlanetData | null) => void;
};

export default function Planet({
  planet,
  startAngle,
  simTimeRef,
  positions,
  selected,
  onSelect,
  onHover,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);

  const texture = useLoader(THREE.TextureLoader, planet.texture);
  const cloudsTexture = useLoader(
    THREE.TextureLoader,
    planet.cloudsTexture ?? planet.texture
  );
  const ringTexture = useLoader(
    THREE.TextureLoader,
    planet.ringTexture ?? planet.texture
  );

  const distance = sceneDistance(planet.distanceAu);
  const radius = sceneRadius(planet.radiusKm);
  const tiltRad = (planet.axialTiltDeg * Math.PI) / 180;
  const spinDirection = planet.rotationPeriodHours < 0 ? -1 : 1;

  // radians per simulated day, anchored to SIM_EPOCH_MS so the whole scene
  // is a deterministic function of "current simulated time" — jumping to a
  // date or resuming playback both just move that one clock.
  const orbitSpeedPerDay = useMemo(
    () => (2 * Math.PI) / planet.orbitalPeriodDays,
    [planet.orbitalPeriodDays]
  );
  const spinSpeedPerDay = useMemo(
    () =>
      (spinDirection * (2 * Math.PI) * 24) /
      Math.abs(planet.rotationPeriodHours),
    [spinDirection, planet.rotationPeriodHours]
  );

  useEffect(() => {
    if (groupRef.current) {
      positions.set(planet.id, groupRef.current.position);
    }
    return () => {
      positions.delete(planet.id);
    };
  }, [planet.id, positions]);

  useFrame((_, delta) => {
    const daysSinceEpoch = (simTimeRef.current - SIM_EPOCH_MS) / 86_400_000;
    const angle = startAngle + orbitSpeedPerDay * daysSinceEpoch;

    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(angle) * distance,
        0,
        Math.sin(angle) * distance
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = spinSpeedPerDay * daysSinceEpoch;
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.02;
    }
  });

  return (
    <group ref={groupRef} rotation={[0, 0, tiltRad]}>
      <mesh
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(planet);
        }}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(planet);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          onHover(null);
          document.body.style.cursor = "auto";
        }}
      >
        <sphereGeometry args={[radius, 48, 48]} />
        <meshStandardMaterial map={texture} roughness={0.9} metalness={0} />
      </mesh>

      {planet.cloudsTexture && (
        <mesh ref={cloudsRef} scale={1.01}>
          <sphereGeometry args={[radius, 48, 48]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            opacity={0.4}
            depthWrite={false}
          />
        </mesh>
      )}

      {planet.ringTexture && (
        <mesh rotation={[Math.PI / 2.1, 0, 0]}>
          <ringGeometry args={[radius * 1.4, radius * 2.4, 64]} />
          <meshBasicMaterial
            map={ringTexture}
            side={THREE.DoubleSide}
            transparent
            opacity={0.85}
          />
        </mesh>
      )}

      {selected && (
        <mesh>
          <sphereGeometry args={[radius * 1.15, 32, 32]} />
          <meshBasicMaterial
            color="#818cf8"
            wireframe
            transparent
            opacity={0.5}
          />
        </mesh>
      )}
    </group>
  );
}
