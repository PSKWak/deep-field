"use client";

import Slider from "./Slider";
import type {
  BlackHoleParams,
  GalaxiesParams,
  PlanetsParams,
  SceneMode,
  StarsParams,
} from "@/lib/types";

type ControlPanelProps = {
  mode: SceneMode;
  starsParams: StarsParams;
  setStarsParams: (p: StarsParams) => void;
  galaxiesParams: GalaxiesParams;
  setGalaxiesParams: (p: GalaxiesParams) => void;
  blackHoleParams: BlackHoleParams;
  setBlackHoleParams: (p: BlackHoleParams) => void;
  planetsParams: PlanetsParams;
  setPlanetsParams: (p: PlanetsParams) => void;
  simDate: Date;
  onSetSimDate: (d: Date) => void;
  onJumpToNow: () => void;
};

function toDatetimeLocalValue(d: Date): string {
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export default function ControlPanel({
  mode,
  starsParams,
  setStarsParams,
  galaxiesParams,
  setGalaxiesParams,
  blackHoleParams,
  setBlackHoleParams,
  planetsParams,
  setPlanetsParams,
  simDate,
  onSetSimDate,
  onJumpToNow,
}: ControlPanelProps) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <h2 className="text-sm font-medium text-neutral-200">Controls</h2>

      {mode === "stars" && (
        <div className="flex flex-col gap-3">
          <Slider
            label="Star count"
            value={starsParams.count}
            min={500}
            max={8000}
            step={100}
            formatValue={(v) => Math.round(v).toString()}
            onChange={(v) => setStarsParams({ ...starsParams, count: v })}
          />
          <Slider
            label="Spread"
            value={starsParams.spread}
            min={4}
            max={20}
            step={0.5}
            onChange={(v) => setStarsParams({ ...starsParams, spread: v })}
          />
          <Slider
            label="Twinkle speed"
            value={starsParams.twinkleSpeed}
            min={0}
            max={3}
            step={0.05}
            onChange={(v) =>
              setStarsParams({ ...starsParams, twinkleSpeed: v })
            }
          />
          <Slider
            label="Color temperature"
            value={starsParams.colorTemp}
            min={0}
            max={1}
            step={0.01}
            formatValue={(v) => (v < 0.5 ? "cool" : "hot")}
            onChange={(v) =>
              setStarsParams({ ...starsParams, colorTemp: v })
            }
          />
        </div>
      )}

      {mode === "galaxies" && (
        <div className="flex flex-col gap-3">
          <Slider
            label="Particles"
            value={galaxiesParams.particles}
            min={2000}
            max={20000}
            step={500}
            formatValue={(v) => Math.round(v).toString()}
            onChange={(v) =>
              setGalaxiesParams({ ...galaxiesParams, particles: v })
            }
          />
          <Slider
            label="Arm count"
            value={galaxiesParams.armCount}
            min={2}
            max={6}
            step={1}
            formatValue={(v) => Math.round(v).toString()}
            onChange={(v) =>
              setGalaxiesParams({ ...galaxiesParams, armCount: v })
            }
          />
          <Slider
            label="Arm tightness"
            value={galaxiesParams.armTightness}
            min={0.1}
            max={1.2}
            step={0.02}
            onChange={(v) =>
              setGalaxiesParams({ ...galaxiesParams, armTightness: v })
            }
          />
          <Slider
            label="Spin speed"
            value={galaxiesParams.spinSpeed}
            min={0}
            max={3}
            step={0.05}
            onChange={(v) =>
              setGalaxiesParams({ ...galaxiesParams, spinSpeed: v })
            }
          />
        </div>
      )}

      {mode === "planets" && (
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1 text-xs text-neutral-300">
            <span className="flex justify-between">
              <span>Jump to date</span>
              <button
                onClick={onJumpToNow}
                className="text-indigo-400 hover:text-indigo-300"
              >
                Now
              </button>
            </span>
            <input
              type="datetime-local"
              value={toDatetimeLocalValue(simDate)}
              onChange={(e) => {
                if (!e.target.value) return;
                const d = new Date(e.target.value);
                if (!Number.isNaN(d.getTime())) onSetSimDate(d);
              }}
              className="rounded-md border border-white/10 bg-black/40 px-2 py-1 text-xs text-neutral-200 [color-scheme:dark]"
            />
          </label>
          <p className="text-xs text-neutral-500">
            Orbital motion and rotation are real; the starting alignment is
            illustrative, not precise ephemeris data.
          </p>
          <Slider
            label="Simulation speed"
            value={planetsParams.timeScale}
            min={0}
            max={200}
            step={1}
            formatValue={(v) => `${Math.round(v)} days/sec`}
            onChange={(v) =>
              setPlanetsParams({ ...planetsParams, timeScale: v })
            }
          />
          <label className="flex items-center justify-between text-xs text-neutral-300">
            <span>Show orbit paths</span>
            <input
              type="checkbox"
              checked={planetsParams.showOrbits === 1}
              onChange={(e) =>
                setPlanetsParams({
                  ...planetsParams,
                  showOrbits: e.target.checked ? 1 : 0,
                })
              }
              className="accent-indigo-400"
            />
          </label>
          <p className="text-xs text-neutral-500">
            Distances and sizes are compressed to fit the screen — orbital
            speeds, rotation, and day/year lengths are real.
          </p>
        </div>
      )}

      {mode === "blackholes" && (
        <div className="flex flex-col gap-3">
          <Slider
            label="Disk density"
            value={blackHoleParams.diskDensity}
            min={0.2}
            max={5}
            step={0.1}
            onChange={(v) =>
              setBlackHoleParams({ ...blackHoleParams, diskDensity: v })
            }
          />
          <Slider
            label="Disk temperature"
            value={blackHoleParams.diskTemp}
            min={0}
            max={1}
            step={0.01}
            formatValue={(v) => (v < 0.5 ? "blue-white" : "orange")}
            onChange={(v) =>
              setBlackHoleParams({ ...blackHoleParams, diskTemp: v })
            }
          />
          <Slider
            label="Spin speed"
            value={blackHoleParams.spinSpeed}
            min={0}
            max={4}
            step={0.1}
            onChange={(v) =>
              setBlackHoleParams({ ...blackHoleParams, spinSpeed: v })
            }
          />
          <Slider
            label="Horizon size"
            value={blackHoleParams.horizonSize}
            min={0.5}
            max={3}
            step={0.1}
            onChange={(v) =>
              setBlackHoleParams({ ...blackHoleParams, horizonSize: v })
            }
          />

          <div className="mt-1 border-t border-white/10 pt-3">
            <p className="mb-2 text-xs font-medium text-neutral-300">
              Gravity demo
            </p>
            <p className="mb-2 text-xs text-neutral-500">
              Click near the disk to drop a test particle and watch gravity
              pull it in — close drops spaghettify, distant ones can orbit or
              escape.
            </p>
            <div className="flex flex-col gap-3">
              <Slider
                label="Gravity strength"
                value={blackHoleParams.gravityStrength}
                min={0.2}
                max={3}
                step={0.1}
                onChange={(v) =>
                  setBlackHoleParams({ ...blackHoleParams, gravityStrength: v })
                }
              />
              <Slider
                label="Particle initial spin"
                value={blackHoleParams.particleSpin}
                min={0}
                max={1.5}
                step={0.05}
                formatValue={(v) => (v === 0 ? "straight fall" : v.toFixed(2))}
                onChange={(v) =>
                  setBlackHoleParams({ ...blackHoleParams, particleSpin: v })
                }
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
