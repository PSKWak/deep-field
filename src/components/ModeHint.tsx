"use client";

import type { SceneMode } from "@/lib/types";

type Hint = {
  gestures: string[];
  controls: { name: string; what: string }[];
};

const HINTS: Record<SceneMode, Hint> = {
  stars: {
    gestures: ["Drag to orbit the field", "Scroll to zoom in and out"],
    controls: [
      {
        name: "Star count",
        what: "how many stars are generated — raise it for a dense cluster, lower it if the scene stutters",
      },
      {
        name: "Colour temperature",
        what: "shifts the field from cool blue (hot, young stars) to red (cooler, older ones)",
      },
    ],
  },
  galaxies: {
    gestures: ["Drag to orbit", "Scroll to zoom"],
    controls: [
      {
        name: "Arm count",
        what: "how many spiral arms wind out of the core — real spirals usually have two to four",
      },
      {
        name: "Arm tightness",
        what: "how tightly the arms coil; loose arms make a sprawling spiral, tight ones a near-ring",
      },
    ],
  },
  planets: {
    gestures: [
      "Click a planet to fly the camera to it",
      "Drag to orbit, scroll to zoom, right-drag to pan",
      "Click empty space to deselect",
    ],
    controls: [
      {
        name: "Simulation speed",
        what: "how many simulated days pass per real second — set it to 0 to freeze the system",
      },
      {
        name: "Jump to date",
        what: "moves the whole system to that moment; orbital periods are real, so positions advance correctly",
      },
    ],
  },
  blackholes: {
    gestures: [
      "Click near the disk to drop a test particle and watch it fall",
      "Zoom in close to reveal the labelled anatomy",
      "Drag to orbit, scroll to zoom",
    ],
    controls: [
      {
        name: "Horizon size",
        what: "scales the event horizon — the point of no return, where escape would need to exceed light speed",
      },
      {
        name: "Particle initial spin",
        what: "sideways speed given to a dropped particle; zero falls straight in, higher values can orbit or escape",
      },
    ],
  },
  learn: {
    gestures: [
      "Click the light curve where you think a planet crossed its star",
      "Then run the algorithm to see what it found",
    ],
    controls: [
      {
        name: "Exoplanet Lab",
        what: "real Kepler brightness measurements — hunt for the dips that reveal a planet",
      },
      {
        name: "Your Sky",
        what: "the real sky over any city on any date, saveable as an image",
      },
    ],
  },
};

type ModeHintProps = {
  mode: SceneMode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Controlled on purpose: the parent opens this the first time each mode is
 * visited, from the mode-change handler. Deciding that here would mean
 * setting state from an effect on every mode change.
 */
export default function ModeHint({
  mode,
  open,
  onOpenChange,
}: ModeHintProps) {
  const hint = HINTS[mode];

  return (
    <div className="relative">
      <button
        onClick={() => onOpenChange(!open)}
        aria-label="How this mode works"
        aria-expanded={open}
        className={`flex h-7 w-7 items-center justify-center rounded-full border text-xs transition-colors ${
          open
            ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-200"
            : "border-white/10 bg-black/40 text-neutral-400 backdrop-blur-md hover:text-neutral-200"
        }`}
      >
        ?
      </button>

      {open && (
        /* Full-width card on phones: anchoring an 18rem popup to this button
           would push it off the left edge on a narrow screen. */
        <div className="fixed inset-x-4 top-16 z-50 rounded-xl border border-white/10 bg-black/90 p-4 text-left backdrop-blur-md sm:absolute sm:inset-x-auto sm:right-0 sm:top-9 sm:w-72">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="text-xs font-medium text-neutral-200">
              How this mode works
            </h3>
            <button
              onClick={() => onOpenChange(false)}
              className="text-xs text-neutral-500 hover:text-neutral-300"
            >
              Got it
            </button>
          </div>

          <ul className="mb-3 flex flex-col gap-1">
            {hint.gestures.map((g) => (
              <li key={g} className="flex gap-1.5 text-xs text-neutral-400">
                <span className="text-indigo-400">→</span>
                {g}
              </li>
            ))}
          </ul>

          <dl className="flex flex-col gap-1.5 border-t border-white/10 pt-2.5">
            {hint.controls.map((c) => (
              <div key={c.name}>
                <dt className="text-xs text-neutral-300">{c.name}</dt>
                <dd className="text-xs leading-relaxed text-neutral-500">
                  {c.what}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  );
}
