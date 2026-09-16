"use client";

import { ANATOMY_PARTS } from "@/lib/blackHoleAnatomy";
import AnatomyLabel from "./AnatomyLabel";

function part(id: string) {
  const found = ANATOMY_PARTS.find((p) => p.id === id);
  if (!found) throw new Error(`Unknown anatomy part: ${id}`);
  return found;
}

export default function BlackHoleAnatomy({ horizonSize }: { horizonSize: number }) {
  const h = horizonSize;

  return (
    <group>
      <AnatomyLabel part={part("singularity")} position={[0, 0, 0]} />
      <AnatomyLabel
        part={part("event-horizon")}
        position={[h * 0.95, h * 0.35, 0]}
      />
      <AnatomyLabel
        part={part("event-horizon-shadow")}
        position={[0, h * 1.4, 0]}
      />
      <AnatomyLabel
        part={part("photon-sphere")}
        position={[h * 1.15 * Math.cos(Math.PI / 4), 0, h * 1.15 * Math.sin(Math.PI / 4)]}
      />
      <AnatomyLabel part={part("corona")} position={[0, h * 2.7, 0]} />
      <AnatomyLabel
        part={part("accretion-disk")}
        position={[h * 5.0, 0, 0]}
        align="left"
      />
      <AnatomyLabel
        part={part("doppler-beaming")}
        position={[-h * 3.2, 0, 0]}
        align="right"
      />
      <AnatomyLabel
        part={part("particle-jets")}
        position={[0, -h * 3.2, 0]}
      />
    </group>
  );
}
