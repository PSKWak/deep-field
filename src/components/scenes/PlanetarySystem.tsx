"use client";

import { Suspense } from "react";
import { PLANETS, sceneDistance, type PlanetData } from "@/lib/planets";
import Sun from "./Sun";
import Planet from "./Planet";
import OrbitRing from "./OrbitRing";

type PlanetarySystemProps = {
  timeScale: number;
  showOrbits: boolean;
  selectedPlanet: PlanetData | null;
  onSelect: (planet: PlanetData) => void;
};

export default function PlanetarySystem({
  timeScale,
  showOrbits,
  selectedPlanet,
  onSelect,
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
            timeScale={timeScale}
            selected={selectedPlanet?.id === planet.id}
            onSelect={onSelect}
          />
        </Suspense>
      ))}
    </group>
  );
}
