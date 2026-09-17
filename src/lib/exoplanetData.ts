import rawCurves from "./data/lightCurves.json";

/**
 * Real Kepler long-cadence photometry (PDCSAP flux) for three confirmed
 * planets, downloaded from the MAST Kepler archive and sliced to a 12-day
 * window. Flux is normalized to 1.0 and a 2nd-order polynomial fit to the
 * out-of-transit points has been divided out to remove instrumental drift;
 * the transits themselves are untouched real measurements.
 *
 * Transit parameters (period, depth, duration) are the published values from
 * the NASA Exoplanet Archive KOI cumulative table.
 */
export type LightCurve = {
  kepid: number;
  planet: string;
  periodDays: number;
  depthPpm: number;
  durationHours: number;
  quarterFile: string;
  /** point-to-point photometric scatter of the out-of-transit baseline */
  scatterPpm: number;
  /** days since the start of the slice */
  days: number[];
  /** relative flux, 1.0 = baseline brightness */
  flux: number[];
};

export type TargetInfo = {
  curve: LightCurve;
  /** common name of the star, where it has one */
  starName: string;
  difficulty: "obvious" | "clear" | "subtle";
  planetRadiusEarths: number;
  /** what the user should take away from this particular target */
  blurb: string;
};

const CURVES = rawCurves as LightCurve[];

function curve(planet: string): LightCurve {
  const found = CURVES.find((c) => c.planet === planet);
  if (!found) throw new Error(`Missing bundled light curve for ${planet}`);
  return found;
}

export const TARGETS: TargetInfo[] = [
  {
    curve: curve("Kepler-1 b"),
    starName: "TrES-2 (GSC 03549-02811)",
    difficulty: "obvious",
    planetRadiusEarths: 13.04,
    blurb:
      "A hot Jupiter that blocks 1.4% of its star's light — one of the deepest transits Kepler ever watched. Start here: if you can see this one, you understand the method.",
  },
  {
    curve: curve("Kepler-2 b"),
    starName: "HAT-P-7",
    difficulty: "clear",
    planetRadiusEarths: 16.1,
    blurb:
      "Also called HAT-P-7 b. Bigger than Jupiter but orbiting a bigger, brighter star, so it blocks proportionally less light — 0.67%. The dips are broader here because the transit lasts nearly 4 hours.",
  },
  {
    curve: curve("Kepler-4 b"),
    starName: "Kepler-4",
    difficulty: "subtle",
    planetRadiusEarths: 4.13,
    blurb:
      "A Neptune-sized planet blocking just 0.073% of its star — barely 10x the photometric noise. This is where eyeballing breaks down and the algorithms earn their keep.",
  },
];

/** Mid-times of the real transits present in the slice, measured by grouping
 * the points that fall below half the published transit depth. Used as the
 * ground truth when scoring the user's guess. */
export function transitCenters(c: LightCurve): number[] {
  const threshold = 1 - (0.5 * c.depthPpm) / 1e6;
  const centers: number[] = [];
  let group: number[] = [];

  const flush = () => {
    if (group.length > 0) {
      centers.push(group.reduce((a, b) => a + b, 0) / group.length);
      group = [];
    }
  };

  for (let i = 0; i < c.days.length; i++) {
    if (c.flux[i] >= threshold) continue;
    // A gap larger than a third of a day means this is a separate transit.
    if (group.length > 0 && c.days[i] - group[group.length - 1] > 0.3) flush();
    group.push(c.days[i]);
  }
  flush();

  return centers;
}
