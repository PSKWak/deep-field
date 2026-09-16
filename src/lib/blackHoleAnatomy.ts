export type AnatomyPart = {
  id: string;
  label: string;
  description: string;
};

// Condensed from NASA Science: "Black Hole Anatomy"
// https://science.nasa.gov/universe/black-holes/anatomy/
export const ANATOMY_PARTS: AnatomyPart[] = [
  {
    id: "singularity",
    label: "Singularity",
    description:
      "The crushing point at the very center, where matter is compressed to infinite density — general relativity's prediction for where everything falling in ultimately ends up.",
  },
  {
    id: "event-horizon",
    label: "Event Horizon",
    description:
      "The point of no return — the black hole's \"surface.\" Inside it, the escape velocity exceeds the speed of light, so nothing, not even light, can get back out.",
  },
  {
    id: "event-horizon-shadow",
    label: "Event Horizon Shadow",
    description:
      "The dark zone left by light captured by the event horizon and light bent away by gravitational lensing — roughly twice as big as the event horizon itself.",
  },
  {
    id: "photon-sphere",
    label: "Photon Sphere",
    description:
      "Thin rings of light at the edge of the shadow — highly distorted images of the accretion disk, where light has orbited the black hole multiple times before escaping.",
  },
  {
    id: "accretion-disk",
    label: "Disk",
    description:
      "Hot, rapidly spinning gas pulled in by the black hole's gravity. It's the main source of light we actually see from a black hole.",
  },
  {
    id: "doppler-beaming",
    label: "Doppler Beaming",
    description:
      "The side of the disk spinning toward us looks brighter and bluer; the side spinning away looks dimmer and redder — the optical version of a siren's pitch rising and falling.",
  },
  {
    id: "corona",
    label: "Corona",
    description:
      "A billion-degree cloud of particles above the disk, moving near the speed of light. One of the most extreme environments in the universe, and a source of high-energy X-rays.",
  },
  {
    id: "particle-jets",
    label: "Particle Jets",
    description:
      "Near the disk's inner edge, some material gets redirected into jets blasting out at near light-speed — from supermassive black holes, these can stretch hundreds of thousands of light-years.",
  },
];

export const ANATOMY_SOURCE_URL =
  "https://science.nasa.gov/universe/black-holes/anatomy/";
