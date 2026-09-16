"use client";

import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Stars } from "@react-three/drei";
import * as THREE from "three";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import StarField from "./scenes/StarField";
import GalaxyField from "./scenes/GalaxyField";
import BlackHole from "./scenes/BlackHole";
import PlanetarySystem from "./scenes/PlanetarySystem";
import SimClockTicker from "./scenes/SimClockTicker";
import CameraRig from "./scenes/CameraRig";
import ControlPanel from "./ControlPanel";
import ApodPanel from "./ApodPanel";
import PlanetInfoPanel from "./PlanetInfoPanel";
import BlackHoleAudio from "./BlackHoleAudio";
import BlackHoleInfoPanel from "./BlackHoleInfoPanel";
import BlackHoleImagePanel from "./BlackHoleImagePanel";
import type {
  BlackHoleParams,
  GalaxiesParams,
  PlanetsParams,
  SceneMode,
  StarsParams,
} from "@/lib/types";
import type { PlanetData } from "@/lib/planets";
import { BLACK_HOLE_TYPES, type BlackHoleTypeId } from "@/lib/blackHoleTypes";

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
  const [hoveredPlanet, setHoveredPlanet] = useState<PlanetData | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

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

  const [blackHoleType, setBlackHoleType] =
    useState<BlackHoleTypeId>("supermassive");
  const [blackHoleParams, setBlackHoleParams] = useState<BlackHoleParams>({
    diskDensity: 2,
    diskTemp:
      BLACK_HOLE_TYPES.find((t) => t.id === "supermassive")?.diskTemp ?? 0.6,
    spinSpeed: 1,
    horizonSize:
      BLACK_HOLE_TYPES.find((t) => t.id === "supermassive")?.horizonSize ??
      1.2,
    gravityStrength: 1,
    particleSpin: 0.5,
  });

  const [planetsParams, setPlanetsParams] = useState<PlanetsParams>({
    timeScale: 20,
    showOrbits: 1,
  });

  // Shared simulated clock (ms epoch) driving all planet positions. Lives in
  // a ref so the 60fps orbit math never triggers a React re-render; a slow
  // 1s ticker below mirrors it into state for the on-screen date/time UI.
  const simTimeRef = useRef(Date.now());
  const [simDateDisplay, setSimDateDisplay] = useState(new Date());
  const positionsRef = useRef(new Map<string, THREE.Vector3>());
  const controlsRef = useRef<OrbitControlsImpl | null>(null);

  useEffect(() => {
    const id = setInterval(
      () => setSimDateDisplay(new Date(simTimeRef.current)),
      1000
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (mode !== "planets") {
      setSelectedPlanet(null);
      setHoveredPlanet(null);
      document.body.style.cursor = "auto";
    }
  }, [mode]);

  return (
    <div
      className="relative h-screen w-full overflow-hidden bg-black"
      onPointerMove={(e) => setMousePos({ x: e.clientX, y: e.clientY })}
    >
      <Canvas
        camera={{ position: [0, 14, 45], fov: 55 }}
        onPointerMissed={() => {
          if (mode === "planets") setSelectedPlanet(null);
        }}
      >
        <color attach="background" args={["#020204"]} />
        <ambientLight intensity={mode === "planets" ? 0.35 : 0.2} />
        <Stars radius={120} depth={60} count={1500} factor={3} fade />

        {mode === "stars" && <StarField params={starsParams} />}
        {mode === "galaxies" && <GalaxyField params={galaxiesParams} />}
        {mode === "blackholes" && <BlackHole params={blackHoleParams} />}
        {mode === "planets" && (
          <>
            <SimClockTicker
              simTimeRef={simTimeRef}
              timeScale={planetsParams.timeScale}
            />
            <PlanetarySystem
              simTimeRef={simTimeRef}
              positions={positionsRef.current}
              showOrbits={planetsParams.showOrbits === 1}
              selectedPlanet={selectedPlanet}
              onSelect={(p) => {
                setSelectedPlanet(p);
                setPanelOpen(true);
              }}
              onHover={setHoveredPlanet}
            />
            <CameraRig
              selectedPlanet={selectedPlanet}
              positions={positionsRef.current}
              controlsRef={controlsRef}
            />
          </>
        )}

        <OrbitControls
          ref={controlsRef}
          enablePan={mode === "planets"}
          minDistance={mode === "planets" ? 1.5 : 3}
          maxDistance={mode === "planets" ? 220 : 40}
          autoRotate={mode === "stars" || mode === "galaxies"}
          autoRotateSpeed={0.3}
          zoomSpeed={2.2}
        />
      </Canvas>

      {/* hover tooltip */}
      {hoveredPlanet && (
        <div
          className="pointer-events-none fixed z-50 rounded-md border border-white/10 bg-black/80 px-2 py-1 text-xs text-white backdrop-blur-sm"
          style={{ left: mousePos.x + 14, top: mousePos.y + 14 }}
        >
          {hoveredPlanet.name}
        </div>
      )}

      {/* top bar */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-4">
        <div className="pointer-events-auto flex flex-col gap-1">
          <h1 className="text-lg font-semibold tracking-tight text-white">
            Deep Field
          </h1>
          <p className="text-xs text-neutral-500">
            {mode === "planets"
              ? "Click a planet to fly to it — drag to orbit, scroll to zoom"
              : mode === "blackholes"
              ? "Click near the disk to drop a test particle — drag to orbit, scroll to zoom"
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
            blackHoleType={blackHoleType}
            onSelectBlackHoleType={(id) => {
              setBlackHoleType(id);
              const preset = BLACK_HOLE_TYPES.find((t) => t.id === id);
              if (preset) {
                setBlackHoleParams({
                  ...blackHoleParams,
                  horizonSize: preset.horizonSize,
                  diskTemp: preset.diskTemp,
                });
              }
            }}
            planetsParams={planetsParams}
            setPlanetsParams={setPlanetsParams}
            simDate={simDateDisplay}
            onSetSimDate={(d) => {
              simTimeRef.current = d.getTime();
              setSimDateDisplay(d);
            }}
            onJumpToNow={() => {
              simTimeRef.current = Date.now();
              setSimDateDisplay(new Date());
            }}
          />
          {mode === "planets" && selectedPlanet && (
            <PlanetInfoPanel
              planet={selectedPlanet}
              now={simDateDisplay}
              onDeselect={() => setSelectedPlanet(null)}
            />
          )}
          {mode === "blackholes" && (
            <BlackHoleInfoPanel
              type={
                BLACK_HOLE_TYPES.find((t) => t.id === blackHoleType) ??
                BLACK_HOLE_TYPES[0]
              }
            />
          )}
          {mode === "blackholes" && <BlackHoleImagePanel type={blackHoleType} />}
          {mode === "blackholes" && <BlackHoleAudio />}
          {mode !== "planets" && <ApodPanel />}
        </div>
      )}
    </div>
  );
}
