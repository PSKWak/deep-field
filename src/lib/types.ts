export type SceneMode = "stars" | "galaxies" | "blackholes" | "planets";

export type StarsParams = {
  count: number;
  spread: number;
  twinkleSpeed: number;
  colorTemp: number; // 0 = cool blue, 1 = hot red
};

export type GalaxiesParams = {
  particles: number;
  armCount: number;
  armTightness: number;
  spinSpeed: number;
};

export type BlackHoleParams = {
  diskDensity: number;
  diskTemp: number; // 0 = cool/blue-white, 1 = hot orange
  spinSpeed: number;
  horizonSize: number;
  /** multiplier on the gravity demo's pull strength */
  gravityStrength: number;
  /** initial tangential speed of dropped test particles, as a fraction of
   * local circular-orbit speed (0 = straight infall) */
  particleSpin: number;
};

export type PlanetsParams = {
  /** simulated days that pass per real second */
  timeScale: number;
  showOrbits: 0 | 1;
};
