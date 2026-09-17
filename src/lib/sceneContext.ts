import { BLACK_HOLE_TYPES, type BlackHoleTypeId } from "./blackHoleTypes";
import type {
  BlackHoleParams,
  GalaxiesParams,
  PlanetsParams,
  SceneMode,
  StarsParams,
} from "./types";

/** Snapshot of what the user is currently looking at, sent with every chat
 * request so answers can be grounded in the live scene rather than generic. */
export type SceneContext = {
  mode: SceneMode;
  stars?: StarsParams;
  galaxies?: GalaxiesParams;
  blackHole?: BlackHoleParams;
  blackHoleType?: BlackHoleTypeId;
  planets?: PlanetsParams;
  selectedPlanetName?: string;
  simDateIso?: string;
};

const BASE_PROMPT = `You are the guide inside "Deep Field", an interactive 3D space explorer.
The user is looking at a live 3D scene while they talk to you. Answer their
questions about space, astronomy and astrophysics, and connect your answers to
what is on their screen right now when it is relevant.

Rules:
- Be concise: 2 to 4 short paragraphs at most, usually less.
- Be accurate. Real numbers and real object names are better than vague awe.
- If the visualization is simplified or not to scale, say so plainly rather
  than letting the user believe the picture is literal.
- If you do not know something or it is genuinely unsettled science, say that.
- Plain prose. No markdown headings, no bullet lists unless the user asks.`;

function describeScene(ctx: SceneContext): string {
  switch (ctx.mode) {
    case "stars": {
      const p = ctx.stars;
      if (!p) return "The user is in Stars mode.";
      return `The user is in Stars mode: a procedural starfield with ${Math.round(
        p.count
      )} stars, spread ${p.spread}, twinkle speed ${p.twinkleSpeed}, and colour
temperature ${p.colorTemp.toFixed(2)} (0 = cool blue, 1 = hot red). These stars
are procedurally generated, not a real catalogue.`;
    }
    case "galaxies": {
      const p = ctx.galaxies;
      if (!p) return "The user is in Galaxies mode.";
      return `The user is in Galaxies mode: a spiral galaxy of ${Math.round(
        p.particles
      )} particles with ${Math.round(p.armCount)} arms, arm tightness ${
        p.armTightness
      }, spinning at speed ${p.spinSpeed}. It is a procedural model of spiral
structure, not a specific real galaxy.`;
    }
    case "blackholes": {
      const p = ctx.blackHole;
      const type = BLACK_HOLE_TYPES.find((t) => t.id === ctx.blackHoleType);
      const typeLine = type
        ? `They have selected the ${type.name} type (${type.massRange}; example: ${type.example}).`
        : "";
      if (!p) return `The user is in Black Holes mode. ${typeLine}`;
      return `The user is in Black Holes mode, looking at a black hole with an
accretion disk. ${typeLine} Current settings: disk density ${
        p.diskDensity
      }, disk temperature ${p.diskTemp.toFixed(
        2
      )} (0 = blue-white, 1 = orange), spin speed ${p.spinSpeed}, horizon size ${
        p.horizonSize
      }, gravity strength ${p.gravityStrength}, dropped-particle initial spin ${
        p.particleSpin
      }. The disk colour here is driven by a slider, so if they ask why it looks
a certain way, explain both the real physics (inner disk is hotter and bluer,
outer disk cooler and redder) and the fact that this particular scene's colour
is theirs to set.`;
    }
    case "planets": {
      const p = ctx.planets;
      const selected = ctx.selectedPlanetName
        ? ` They have ${ctx.selectedPlanetName} selected and the camera flown to it.`
        : "";
      const date = ctx.simDateIso
        ? ` The simulated date is ${ctx.simDateIso}.`
        : "";
      return `The user is in Planets mode: the solar system with real orbital
periods, rotation periods, axial tilts and moon counts from NASA fact sheets.
Distances and planet sizes are visually compressed to fit on screen, so the
spacing and relative sizes are NOT to scale.${selected}${date}${
        p ? ` Simulation speed is ${Math.round(p.timeScale)} days per second.` : ""
      }`;
    }
    case "learn":
      return `The user is in Learn mode, where they can analyse real Kepler
light curves to find exoplanet transits, and reconstruct the real sky for their
birth date and location.`;
  }
}

export function buildSystemPrompt(ctx: SceneContext): string {
  return `${BASE_PROMPT}\n\nCurrent scene:\n${describeScene(ctx)}`;
}

/** Starter questions offered in the chat panel, tailored per mode. */
export function suggestedQuestions(mode: SceneMode): string[] {
  switch (mode) {
    case "stars":
      return [
        "Why are some stars blue and others red?",
        "How do astronomers measure a star's temperature?",
        "What happens when a star runs out of fuel?",
      ];
    case "galaxies":
      return [
        "Why do galaxies form spiral arms?",
        "How fast is the Milky Way spinning?",
        "What happens when two galaxies collide?",
      ];
    case "blackholes":
      return [
        "Why does the accretion disk glow?",
        "What would I actually see falling in?",
        "How did we photograph a black hole?",
      ];
    case "planets":
      return [
        "Why is Venus hotter than Mercury?",
        "How do we know the orbital periods so precisely?",
        "Why does Uranus spin on its side?",
      ];
    case "learn":
      return [
        "How does the transit method find planets?",
        "What is a light curve?",
        "How does machine learning help find exoplanets?",
      ];
  }
}
