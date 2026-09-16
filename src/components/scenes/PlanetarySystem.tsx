"use client";

import { Suspense } from "react";
import * as THREE from "three";
import { PLANETS, sceneDistance, type PlanetData } from "@/lib/planets";
import Sun from "./Sun";
import Planet from "./Planet";
import OrbitRing from "./OrbitRing";

type PlanetarySystemProps = {
  simTimeRef: React.RefObject<number>;
  positions: Map<string, THREE.Vector3>;
  showOrbits: boolean;
  selectedPlanet: PlanetData | null;
  onSelect: (planet: PlanetData) => void;
  onHover: (planet: PlanetData | null) => void;
};

export default function PlanetarySystem({
  simTimeRef,
  positions,
  showOrbits,
  selectedPlanet,
  onSelect,
  onHover,
}: PlanetarySystemProps) {
  return (
    <group>
      <Suspense fallback={null}>
        <Sun />
      </Suspense>

      {showOrbits &&
        PLANETS.map((planet) => (
          <OrbitRing key={planet.id} radius={sceneDistance(planet.distanceAu)} />
        ))}

      {PLANETS.map((planet, i) => (
        <Suspense key={planet.id} fallback={null}>
          <Planet
            planet={planet}
            startAngle={(i / PLANETS.length) * Math.PI * 2}
            simTimeRef={simTimeRef}
            positions={positions}
            selected={selectedPlanet?.id === planet.id}
            onSelect={onSelect}
            onHover={onHover}
          />
        </Suspense>
      ))}
    </group>
  );
}
