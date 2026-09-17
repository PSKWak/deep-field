import type {
  BlackHoleParams,
  GalaxiesParams,
  PlanetsParams,
  SceneMode,
  StarsParams,
} from "./types";
import type { BlackHoleTypeId } from "./blackHoleTypes";

/**
 * The shareable slice of app state, encoded into the URL hash so a specific
 * view ("Saturn on this date", a tuned galaxy, someone's birth sky) survives a
 * reload and can be sent to another person.
 *
 * The hash is used rather than the query string so that changing it never
 * causes a navigation or a server round-trip.
 */
export type ShareState = {
  mode: SceneMode;
  stars: StarsParams;
  galaxies: GalaxiesParams;
  blackHole: BlackHoleParams;
  blackHoleType: BlackHoleTypeId;
  planets: PlanetsParams;
  /** simulated epoch ms for Planets mode */
  simTime: number;
  selectedPlanetId?: string;
};

const MODES: SceneMode[] = [
  "stars",
  "galaxies",
  "planets",
  "blackholes",
  "learn",
];

/** Compact round-trippable number: trims float noise without losing meaning. */
const n = (v: number) => Number(v.toFixed(4)).toString();

export function encodeState(s: ShareState): string {
  const p = new URLSearchParams();
  p.set("m", s.mode);

  if (s.mode === "stars") {
    p.set("c", n(s.stars.count));
    p.set("sp", n(s.stars.spread));
    p.set("tw", n(s.stars.twinkleSpeed));
    p.set("ct", n(s.stars.colorTemp));
  } else if (s.mode === "galaxies") {
    p.set("pt", n(s.galaxies.particles));
    p.set("ac", n(s.galaxies.armCount));
    p.set("at", n(s.galaxies.armTightness));
    p.set("ss", n(s.galaxies.spinSpeed));
  } else if (s.mode === "blackholes") {
    p.set("bt", s.blackHoleType);
    p.set("dd", n(s.blackHole.diskDensity));
    p.set("dt", n(s.blackHole.diskTemp));
    p.set("bs", n(s.blackHole.spinSpeed));
    p.set("hs", n(s.blackHole.horizonSize));
    p.set("gs", n(s.blackHole.gravityStrength));
    p.set("ps", n(s.blackHole.particleSpin));
  } else if (s.mode === "planets") {
    p.set("ts", n(s.planets.timeScale));
    p.set("or", String(s.planets.showOrbits));
    p.set("t", String(Math.round(s.simTime)));
    if (s.selectedPlanetId) p.set("pl", s.selectedPlanetId);
  }

  return p.toString();
}

function num(p: URLSearchParams, key: string, fallback: number): number {
  const raw = p.get(key);
  if (raw === null) return fallback;
  const v = Number(raw);
  return Number.isFinite(v) ? v : fallback;
}

/** Parse a hash into a partial state. Anything missing or malformed keeps the
 * caller's defaults, so a hand-edited or truncated link degrades rather than
 * breaking the app. */
export function decodeState(
  hash: string,
  defaults: ShareState
): ShareState {
  const p = new URLSearchParams(hash.replace(/^#/, ""));
  if ([...p.keys()].length === 0) return defaults;

  const rawMode = p.get("m");
  const mode = MODES.includes(rawMode as SceneMode)
    ? (rawMode as SceneMode)
    : defaults.mode;

  const clamp = (v: number, lo: number, hi: number) =>
    Math.min(hi, Math.max(lo, v));

  return {
    mode,
    stars: {
      count: clamp(num(p, "c", defaults.stars.count), 500, 8000),
      spread: clamp(num(p, "sp", defaults.stars.spread), 4, 20),
      twinkleSpeed: clamp(num(p, "tw", defaults.stars.twinkleSpeed), 0, 3),
      colorTemp: clamp(num(p, "ct", defaults.stars.colorTemp), 0, 1),
    },
    galaxies: {
      particles: clamp(num(p, "pt", defaults.galaxies.particles), 2000, 20000),
      armCount: clamp(num(p, "ac", defaults.galaxies.armCount), 2, 6),
      armTightness: clamp(
        num(p, "at", defaults.galaxies.armTightness),
        0.1,
        1.2
      ),
      spinSpeed: clamp(num(p, "ss", defaults.galaxies.spinSpeed), 0, 3),
    },
    blackHole: {
      diskDensity: clamp(num(p, "dd", defaults.blackHole.diskDensity), 0.2, 5),
      diskTemp: clamp(num(p, "dt", defaults.blackHole.diskTemp), 0, 1),
      spinSpeed: clamp(num(p, "bs", defaults.blackHole.spinSpeed), 0, 4),
      horizonSize: clamp(num(p, "hs", defaults.blackHole.horizonSize), 0.5, 3),
      gravityStrength: clamp(
        num(p, "gs", defaults.blackHole.gravityStrength),
        0.2,
        3
      ),
      particleSpin: clamp(
        num(p, "ps", defaults.blackHole.particleSpin),
        0,
        1.5
      ),
    },
    blackHoleType:
      (p.get("bt") as BlackHoleTypeId | null) ?? defaults.blackHoleType,
    planets: {
      timeScale: clamp(num(p, "ts", defaults.planets.timeScale), 0, 200),
      showOrbits: num(p, "or", defaults.planets.showOrbits) === 0 ? 0 : 1,
    },
    simTime: num(p, "t", defaults.simTime),
    selectedPlanetId: p.get("pl") ?? undefined,
  };
}
