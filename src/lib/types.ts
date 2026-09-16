export type SceneMode = "stars" | "galaxies" | "blackholes";

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
};
