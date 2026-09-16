"use client";

import { useMemo, useRef } from "react";
import { useFrame, useLoader } from "@react-three/fiber";
import * as THREE from "three";
import type { PlanetData } from "@/lib/planets";
import { sceneDistance, sceneRadius } from "@/lib/planets";

type PlanetProps = {
  planet: PlanetData;
  startAngle: number;
  timeScale: number;
  selected: boolean;
  onSelect: (planet: PlanetData) => void;
};

export default function Planet({
  planet,
  startAngle,
  timeScale,
  selected,
  onSelect,
}: PlanetProps) {
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const cloudsRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef(startAngle);

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

  // radians per simulated day; `timeScale` (simulated days per real second)
  // is applied in the frame loop below.
  const orbitSpeed = useMemo(
    () => (2 * Math.PI) / planet.orbitalPeriodDays,
    [planet.orbitalPeriodDays]
  );
  const spinSpeed = useMemo(
    () =>
      (spinDirection * (2 * Math.PI) * 24) /
      Math.abs(planet.rotationPeriodHours),
    [spinDirection, planet.rotationPeriodHours]
  );

  useFrame((_, delta) => {
    angleRef.current += orbitSpeed * timeScale * delta;
    if (groupRef.current) {
      groupRef.current.position.set(
        Math.cos(angleRef.current) * distance,
        0,
        Math.sin(angleRef.current) * distance
      );
    }
    if (meshRef.current) {
      meshRef.current.rotation.y += spinSpeed * timeScale * delta;
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
