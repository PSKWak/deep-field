export type PlanetId =
  | "mercury"
  | "venus"
  | "earth"
  | "mars"
  | "jupiter"
  | "saturn"
  | "uranus"
  | "neptune";

export type PlanetData = {
  id: PlanetId;
  name: string;
  texture: string;
  nightTexture?: string;
  cloudsTexture?: string;
  ringTexture?: string;
  /** distance from the Sun, in AU (real) */
  distanceAu: number;
  /** orbital period around the Sun, in Earth days (real) */
  orbitalPeriodDays: number;
  /** sidereal rotation period, in hours (real, negative = retrograde) */
  rotationPeriodHours: number;
  /** equatorial radius, in km (real) */
  radiusKm: number;
  /** axial tilt, in degrees (real) */
  axialTiltDeg: number;
  moons: number;
  fact: string;
};

/** Reference epoch for the deterministic orbit/spin phase math below (J2000). */
export const SIM_EPOCH_MS = Date.UTC(2000, 0, 1, 12, 0, 0);

// Real orbital + physical data (NASA planetary fact sheets).
export const PLANETS: PlanetData[] = [
  {
    id: "mercury",
    name: "Mercury",
    texture: "/textures/planets/2k_mercury.jpg",
    distanceAu: 0.387,
    orbitalPeriodDays: 88,
    rotationPeriodHours: 1407.6,
    radiusKm: 2439.7,
    axialTiltDeg: 0.03,
    moons: 0,
    fact: "A day on Mercury (sunrise to sunrise) lasts about 176 Earth days — longer than its own year.",
  },
  {
    id: "venus",
    name: "Venus",
    texture: "/textures/planets/2k_venus_surface.jpg",
    distanceAu: 0.723,
    orbitalPeriodDays: 224.7,
    rotationPeriodHours: -5832.5,
    radiusKm: 6051.8,
    axialTiltDeg: 177.4,
    moons: 0,
    fact: "Venus spins backwards (retrograde) and so slowly that its day is longer than its year.",
  },
  {
    id: "earth",
    name: "Earth",
    texture: "/textures/planets/2k_earth_daymap.jpg",
    nightTexture: "/textures/planets/2k_earth_nightmap.jpg",
    cloudsTexture: "/textures/planets/2k_earth_clouds.jpg",
    distanceAu: 1.0,
    orbitalPeriodDays: 365.25,
    rotationPeriodHours: 23.934,
    radiusKm: 6371,
    axialTiltDeg: 23.44,
    moons: 1,
    fact: "Earth's axial tilt of 23.4° is what gives us seasons as we orbit the Sun.",
  },
  {
    id: "mars",
    name: "Mars",
    texture: "/textures/planets/2k_mars.jpg",
    distanceAu: 1.524,
    orbitalPeriodDays: 687,
    rotationPeriodHours: 24.6229,
    radiusKm: 3389.5,
    axialTiltDeg: 25.19,
    moons: 2,
    fact: "A Martian day (\"sol\") is only 37 minutes longer than an Earth day.",
  },
  {
    id: "jupiter",
    name: "Jupiter",
    texture: "/textures/planets/2k_jupiter.jpg",
    distanceAu: 5.203,
    orbitalPeriodDays: 4331,
    rotationPeriodHours: 9.925,
    radiusKm: 69911,
    axialTiltDeg: 3.13,
    moons: 95,
    fact: "Jupiter spins so fast (under 10 hours) that it bulges visibly at the equator.",
  },
  {
    id: "saturn",
    name: "Saturn",
    texture: "/textures/planets/2k_saturn.jpg",
    ringTexture: "/textures/planets/2k_saturn_ring_alpha.png",
    distanceAu: 9.537,
    orbitalPeriodDays: 10747,
    rotationPeriodHours: 10.656,
    radiusKm: 58232,
    axialTiltDeg: 26.73,
    moons: 146,
    fact: "Saturn is the least dense planet in the solar system — it would float in water.",
  },
  {
    id: "uranus",
    name: "Uranus",
    texture: "/textures/planets/2k_uranus.jpg",
    distanceAu: 19.191,
    orbitalPeriodDays: 30589,
    rotationPeriodHours: -17.24,
    radiusKm: 25362,
    axialTiltDeg: 97.77,
    moons: 28,
    fact: "Uranus rotates on its side (98° tilt), so its poles take turns facing the Sun for decades.",
  },
  {
    id: "neptune",
    name: "Neptune",
    texture: "/textures/planets/2k_neptune.jpg",
    distanceAu: 30.069,
    orbitalPeriodDays: 59800,
    rotationPeriodHours: 16.11,
    radiusKm: 24622,
    axialTiltDeg: 28.32,
    moons: 16,
    fact: "Neptune has the fastest winds in the solar system, reaching over 2,000 km/h.",
  },
];

/**
 * Approximate current "local solar time" on a planet, as HH:MM, derived from
 * its real sidereal rotation period and the current UTC clock. This is a
 * simplification (true solar day differs slightly from sidereal rotation,
 * especially for slow rotators) but is accurate to within minutes for most
 * planets and gives a real, physically grounded sense of day length.
 */
export function getPlanetLocalTime(planet: PlanetData, now: Date): string {
  const msSinceEpoch = now.getTime();
  const rotationMs = Math.abs(planet.rotationPeriodHours) * 3600 * 1000;
  const fraction = (msSinceEpoch % rotationMs) / rotationMs;
  const totalMinutes = fraction * 24 * 60;
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = Math.floor(totalMinutes % 60);
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

export function getEarthDayLengthHours(planet: PlanetData): number {
  return Math.abs(planet.rotationPeriodHours);
}

/** Compressed distance for visualization (real AU spacing would make outer
 * planets unreachable on screen). Not to scale — noted in the UI. */
export function sceneDistance(distanceAu: number): number {
  return 6 + Math.sqrt(distanceAu) * 5.5;
}

/** Compressed radius for visualization so small inner planets stay visible
 * next to Jupiter/Saturn. Not to scale — noted in the UI. */
export function sceneRadius(radiusKm: number): number {
  return 0.35 + Math.pow(radiusKm / 6371, 0.42) * 0.55;
}
