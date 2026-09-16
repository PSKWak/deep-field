export type BlackHoleTypeId =
  | "stellar"
  | "intermediate"
  | "supermassive"
  | "primordial";

export type BlackHoleTypeData = {
  id: BlackHoleTypeId;
  name: string;
  massRange: string;
  example: string;
  /** compressed event-horizon size for the 3D scene (not to scale) */
  horizonSize: number;
  /** 0 = cool blue-white disk, 1 = hot orange disk */
  diskTemp: number;
  description: string;
  fact: string;
};

// Condensed from NASA Science: "Types of Black Holes"
// https://science.nasa.gov/universe/black-holes/types/
export const BLACK_HOLE_TYPES: BlackHoleTypeData[] = [
  {
    id: "stellar",
    name: "Stellar-mass",
    massRange: "~3 to 100 times the Sun's mass",
    example: "Cygnus X-1",
    horizonSize: 0.8,
    diskTemp: 0.3,
    description:
      "Forms when a star more than about 8 times the Sun's mass runs out of fuel, collapses, and explodes as a supernova. If enough mass remains in the core, it collapses further into a black hole.",
    fact: "Only around 50 stellar-mass black holes have been confirmed in the Milky Way, but scientists estimate there could be as many as 100 million.",
  },
  {
    id: "intermediate",
    name: "Intermediate-mass",
    massRange: "~100 to hundreds of thousands of solar masses",
    example: "3XMM J215022.4−055108 (~50,000 solar masses)",
    horizonSize: 1.5,
    diskTemp: 0.5,
    description:
      "A hunted-for missing link between stellar and supermassive black holes. Repeated collisions between stellar-mass black holes over cosmic time should have produced them, but confirmed examples are rare.",
    fact: "Numerous intermediate-mass candidates have been identified, but they're notoriously difficult to confirm.",
  },
  {
    id: "supermassive",
    name: "Supermassive",
    massRange: "Hundreds of thousands to billions of solar masses",
    example: "Sagittarius A* (4 million solar masses)",
    horizonSize: 2.6,
    diskTemp: 0.75,
    description:
      "Found at the center of nearly every large galaxy, including our own Milky Way. Scientists aren't certain how they formed, but they grow by feeding on stars, gas, and merging with other black holes.",
    fact: "Sagittarius A*, at our galaxy's center, is 4 million solar masses — relatively small next to the black hole in galaxy Holmberg 15A, which holds at least 40 billion.",
  },
  {
    id: "primordial",
    name: "Primordial",
    massRange: "Theorized: far less than a paperclip to ~100,000 solar masses",
    example: "None confirmed — theoretical only",
    horizonSize: 0.55,
    diskTemp: 0.2,
    description:
      "A hypothesized fourth category that may have formed in the first second after the Big Bang, when dense pockets of hot early-universe material could have collapsed directly into black holes.",
    fact: "No primordial black hole has ever been confirmed. Smaller ones may have already evaporated via Hawking radiation over the universe's 13.8-billion-year history.",
  },
];
