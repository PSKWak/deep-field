"use client";

import { useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import StarField from "./scenes/StarField";
import GalaxyField from "./scenes/GalaxyField";
import BlackHole from "./scenes/BlackHole";
import PlanetarySystem from "./scenes/PlanetarySystem";
import ControlPanel from "./ControlPanel";
import ApodPanel from "./ApodPanel";
import PlanetInfoPanel from "./PlanetInfoPanel";
import type {
  BlackHoleParams,
  GalaxiesParams,
  PlanetsParams,
  SceneMode,
  StarsParams,
} from "@/lib/types";
import type { PlanetData } from "@/lib/planets";

const MODES: { id: SceneMode; label: string }[] = [
  { id: "stars", label: "Stars" },
  { id: "galaxies", label: "Galaxies" },
  { id: "planets", label: "Planets" },
  { id: "blackholes", label: "Black Holes" },
];

export default function DeepField() {
  const [mode, setMode] = useState<SceneMode>("stars");
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(
    null
  );

  const [starsParams, setStarsParams] = useState<StarsParams>({
    count: 3000,
    spread: 10,
    twinkleSpeed: 1,
    colorTemp: 0.3,
  });

  const [galaxiesParams, setGalaxiesParams] = useState<GalaxiesParams>({
    particles: 8000,
    armCount: 3,
    armTightness: 0.5,
    spinSpeed: 0.6,
  });

  const [blackHoleParams, setBlackHoleParams] = useState<BlackHoleParams>({
    diskDensity: 2,
    diskTemp: 0.6,
    spinSpeed: 1,
    horizonSize: 1.2,
  });

  const [planetsParams, setPlanetsParams] = useState<PlanetsParams>({
    timeScale: 20,
    showOrbits: 1,
  });

  return (
    <div className="relative h-screen w-full overflow-hidden bg-black">
      <Canvas camera={{ position: [0, 14, 45], fov: 55 }}>
        <color attach="background" args={["#020204"]} />
        <ambientLight intensity={mode === "planets" ? 0.35 : 0.2} />
        <Stars radius={120} depth={60} count={1500} factor={3} fade />

        {mode === "stars" && <StarField params={starsParams} />}
        {mode === "galaxies" && <GalaxyField params={galaxiesParams} />}
        {mode === "blackholes" && <BlackHole params={blackHoleParams} />}
        {mode === "planets" && (
          <PlanetarySystem
            timeScale={planetsParams.timeScale}
            showOrbits={planetsParams.showOrbits === 1}
            selectedPlanet={selectedPlanet}
            onSelect={(p) => {
              setSelectedPlanet(p);
              setPanelOpen(true);
            }}
          />
        )}

        <OrbitControls
          enablePan={mode === "planets"}
          minDistance={mode === "planets" ? 1.5 : 3}
          maxDistance={mode === "planets" ? 220 : 40}
          autoRotate={mode !== "planets"}
          autoRotateSpeed={0.3}
          zoomSpeed={2.2}
        />
      </Canvas>

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <div className="pointer-events-auto flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Deep Field
          </h1>
          <p className="text-xs text-neutral-500">
            {mode === "planets"
              ? "Click a planet to inspect it — drag to orbit, scroll to zoom"
              : "Interactive 3D explorer — drag to orbit, scroll to zoom"}
          </p>
        </div>

        <button
          onClick={() => setPanelOpen((v) => !v)}
          className="pointer-events-auto rounded-lg border border-white/10 bg-black/40 px-3 py-1.5 text-xs text-neutral-300 backdrop-blur-md hover:bg-black/60"
        >
          {panelOpen ? "Hide panel" : "Show panel"}
        </button>
      </div>

      {/* mode tabs */}
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
        <div className="pointer-events-auto flex gap-1 rounded-full border border-white/10 bg-black/40 p-1 backdrop-blur-md">
          {MODES.map((m) => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`rounded-full px-4 py-1.5 text-xs transition-colors ${
                mode === m.id
                  ? "bg-indigo-500 text-white"
                  : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* side panel */}
      {panelOpen && (
        <div className="pointer-events-auto absolute right-4 top-20 flex w-72 max-w-[85vw] flex-col gap-4 max-h-[75vh] overflow-y-auto">
          <ControlPanel
            mode={mode}
            starsParams={starsParams}
            setStarsParams={setStarsParams}
            galaxiesParams={galaxiesParams}
            setGalaxiesParams={setGalaxiesParams}
            blackHoleParams={blackHoleParams}
            setBlackHoleParams={setBlackHoleParams}
            planetsParams={planetsParams}
            setPlanetsParams={setPlanetsParams}
          />
          {mode === "planets" && selectedPlanet && (
            <PlanetInfoPanel planet={selectedPlanet} />
          )}
          {mode !== "planets" && <ApodPanel />}
        </div>
      )}
    </div>
  );
}
