import {
  Body,
  Constellation,
  Equator,
  Horizon,
  Illumination,
  MoonPhase,
  Observer,
} from "astronomy-engine";
import rawStars from "./data/brightStars.json";
import { CONSTELLATIONS } from "./constellations";

export type CatalogStar = {
  /** right ascension, J2000, in hours */
  ra: number;
  /** declination, J2000, in degrees */
  dec: number;
  /** visual magnitude */
  mag: number;
  /** Bayer designation as written in the Bright Star Catalogue */
  id: string;
  /** constellation abbreviation */
  con: string;
  /** common name, where the star has a well-known one */
  name?: string;
};

export const STARS = rawStars as CatalogStar[];

/** Brightest entry per Bayer id, so constellation lines resolve to one point
 * even where the catalogue lists both components of a double. */
const STAR_BY_ID = new Map<string, CatalogStar>();
for (const s of STARS) {
  const existing = STAR_BY_ID.get(s.id);
  if (!existing || s.mag < existing.mag) STAR_BY_ID.set(s.id, s);
}

export type SkyPoint = {
  /** projected position on the unit disk, -1..1, y up */
  x: number;
  y: number;
  altitude: number;
  azimuth: number;
  mag: number;
  label?: string;
};

export type PlanetPoint = SkyPoint & {
  body: string;
  /** constellation the body was in, by IAU boundaries */
  constellation: string;
};

export type SkyResult = {
  stars: SkyPoint[];
  planets: PlanetPoint[];
  sun: PlanetPoint;
  moon: PlanetPoint & { phaseFraction: number; phaseName: string };
  /** constellation polylines, already projected; only fully-visible segments */
  figures: { name: string; segments: { x1: number; y1: number; x2: number; y2: number }[] }[];
  /** true when the Sun is below the horizon, i.e. stars were actually visible */
  isNight: boolean;
  /** local sidereal-ish summary strings for the caption */
  visibleCount: number;
};

const PLANET_BODIES: { body: Body; label: string }[] = [
  { body: Body.Mercury, label: "Mercury" },
  { body: Body.Venus, label: "Venus" },
  { body: Body.Mars, label: "Mars" },
  { body: Body.Jupiter, label: "Jupiter" },
  { body: Body.Saturn, label: "Saturn" },
  { body: Body.Uranus, label: "Uranus" },
  { body: Body.Neptune, label: "Neptune" },
];

/**
 * Azimuthal equidistant projection of the visible hemisphere onto a disk:
 * zenith at the centre, horizon at the rim, north up and east left (the
 * convention for a sky chart held overhead).
 */
function project(altitude: number, azimuth: number): { x: number; y: number } {
  const r = (90 - altitude) / 90;
  const theta = (azimuth * Math.PI) / 180;
  return { x: r * Math.sin(theta), y: r * Math.cos(theta) };
}

function moonPhaseName(angle: number): string {
  if (angle < 22.5 || angle >= 337.5) return "new moon";
  if (angle < 67.5) return "waxing crescent";
  if (angle < 112.5) return "first quarter";
  if (angle < 157.5) return "waxing gibbous";
  if (angle < 202.5) return "full moon";
  if (angle < 247.5) return "waning gibbous";
  if (angle < 292.5) return "last quarter";
  return "waning crescent";
}

/**
 * Compute the sky as seen from a given place and moment.
 *
 * Star positions use J2000 catalogue coordinates without a precession
 * correction — over the decades a human lifetime spans that is well under a
 * degree, invisible at this chart's scale. Solar system positions come from
 * astronomy-engine's full ephemeris and are accurate to arcminutes.
 */
export function computeSky(date: Date, latitude: number, longitude: number): SkyResult {
  const observer = new Observer(latitude, longitude, 0);

  const stars: SkyPoint[] = [];
  const projected = new Map<string, SkyPoint>();

  for (const s of STARS) {
    const h = Horizon(date, observer, s.ra, s.dec, "normal");
    if (h.altitude <= 0) continue;
    const { x, y } = project(h.altitude, h.azimuth);
    const point: SkyPoint = {
      x,
      y,
      altitude: h.altitude,
      azimuth: h.azimuth,
      mag: s.mag,
      label: s.name,
    };
    stars.push(point);
    // Only the catalogue's brightest entry for an id anchors a figure line.
    if (STAR_BY_ID.get(s.id) === s) projected.set(s.id, point);
  }

  const figures = CONSTELLATIONS.map((c) => {
    const segments: { x1: number; y1: number; x2: number; y2: number }[] = [];
    for (const chain of c.lines) {
      for (let i = 0; i < chain.length - 1; i++) {
        const a = projected.get(chain[i]);
        const b = projected.get(chain[i + 1]);
        if (a && b) segments.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
      }
    }
    return { name: c.name, segments };
  }).filter((f) => f.segments.length > 0);

  const bodyPoint = (body: Body, label: string): PlanetPoint => {
    const eq = Equator(body, date, observer, true, true);
    const h = Horizon(date, observer, eq.ra, eq.dec, "normal");
    const { x, y } = project(h.altitude, h.azimuth);
    return {
      x,
      y,
      altitude: h.altitude,
      azimuth: h.azimuth,
      mag: body === Body.Sun ? -26 : body === Body.Moon ? -12 : 0,
      label,
      body: label,
      constellation: Constellation(eq.ra, eq.dec).name,
    };
  };

  const sun = bodyPoint(Body.Sun, "Sun");
  const phaseAngle = MoonPhase(date);
  const moon = {
    ...bodyPoint(Body.Moon, "Moon"),
    phaseFraction: Illumination(Body.Moon, date).phase_fraction,
    phaseName: moonPhaseName(phaseAngle),
  };

  const planets = PLANET_BODIES.map(({ body, label }) =>
    bodyPoint(body, label)
  ).filter((p) => p.altitude > 0);

  return {
    stars,
    planets,
    sun,
    moon,
    figures,
    isNight: sun.altitude < 0,
    visibleCount: stars.length,
  };
}

/** How far ahead of UTC the given zone is at that instant, in milliseconds. */
function zoneOffsetMs(instant: Date, timeZone: string): number {
  const dtf = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hour12: false,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
  const parts: Record<string, string> = {};
  for (const p of dtf.formatToParts(instant)) {
    if (p.type !== "literal") parts[p.type] = p.value;
  }
  const asUtc = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    // en-US with hour12:false reports midnight as hour 24.
    Number(parts.hour) % 24,
    Number(parts.minute),
    Number(parts.second)
  );
  return asUtc - instant.getTime();
}

/**
 * Turn a wall-clock date and time in some place's own timezone into the real
 * UTC instant it refers to. Without this, "9pm in Mumbai" would be read as 9pm
 * in whatever zone the browser happens to be in, and the sky would be wrong by
 * however many hours separate them.
 *
 * The two passes resolve daylight-saving boundaries: the first uses the naive
 * timestamp to pick an offset, the second re-checks using the corrected one.
 */
export function zonedTimeToUtc(
  dateStr: string,
  timeStr: string,
  timeZone: string
): Date | null {
  const [y, mo, d] = dateStr.split("-").map(Number);
  const [h, mi] = timeStr.split(":").map(Number);
  if ([y, mo, d, h, mi].some((n) => !Number.isFinite(n))) return null;

  const naive = Date.UTC(y, mo - 1, d, h, mi);
  let instant = naive - zoneOffsetMs(new Date(naive), timeZone);
  instant = naive - zoneOffsetMs(new Date(instant), timeZone);
  const result = new Date(instant);
  return Number.isNaN(result.getTime()) ? null : result;
}

/** Label like "UTC+5:30" for the given zone at that moment. */
export function zoneLabel(instant: Date, timeZone: string): string {
  const minutes = Math.round(zoneOffsetMs(instant, timeZone) / 60000);
  const sign = minutes < 0 ? "-" : "+";
  const abs = Math.abs(minutes);
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `UTC${sign}${h}${m ? `:${m.toString().padStart(2, "0")}` : ""}`;
}

/** One-line human summary for the chart caption. */
export function describeSky(sky: SkyResult): string {
  const parts: string[] = [];

  if (sky.isNight) {
    parts.push(
      `${sky.visibleCount} catalogued stars were above the horizon`
    );
  } else {
    parts.push(
      `the Sun was still up, ${sky.sun.altitude.toFixed(
        0
      )}° above the horizon, so these stars were there but washed out`
    );
  }

  if (sky.moon.altitude > 0) {
    parts.push(
      `the Moon was up in ${sky.moon.constellation} as a ${
        sky.moon.phaseName
      } (${Math.round(sky.moon.phaseFraction * 100)}% lit)`
    );
  } else {
    parts.push(`the Moon was below the horizon (${sky.moon.phaseName})`);
  }

  const named = sky.planets.filter((p) =>
    ["Mercury", "Venus", "Mars", "Jupiter", "Saturn"].includes(p.body)
  );
  if (named.length > 0) {
    parts.push(
      named
        .map((p) => `${p.body} in ${p.constellation}`)
        .join(", ")
        .replace(/, ([^,]*)$/, " and $1")
    );
  }

  return parts.join("; ") + ".";
}
