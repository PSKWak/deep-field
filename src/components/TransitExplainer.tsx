"use client";

import { useState } from "react";

type Section = {
  title: string;
  body: string[];
};

const SECTIONS: Section[] = [
  {
    title: "1. What you're actually looking at",
    body: [
      "Kepler stared at one patch of sky for four years, measuring the brightness of ~150,000 stars every 30 minutes. Each dot on the chart is one of those measurements. The y-axis is in parts per million: -10,000 ppm means the star got 1% fainter.",
      "Nothing in that data says \"planet\". All you get is a number that wobbles. The wobble comes from real photon-counting noise, from the spacecraft heating and cooling, from the star itself flickering — and, occasionally, from a planet passing in front.",
    ],
  },
  {
    title: "2. Why a dip means a planet",
    body: [
      "If a planet's orbit happens to be edge-on from our point of view, it passes between us and its star once per orbit. While it does, it blocks a fraction of the star's disk, and the star dims by roughly (planet radius / star radius)².",
      "That squared ratio is why this method is biased toward big planets close to their stars: Jupiter across a Sun-sized star blocks ~1%, but Earth blocks only 0.008%. It's also why a detection gives you the planet's size directly — the depth of the dip is the measurement.",
      "The catch: a single dip proves nothing. Stars have spots, instruments glitch. What makes it a planet is that the dip repeats on a strict period, with the same depth and the same duration, every time.",
    ],
  },
  {
    title: "3. How the machine finds them",
    body: [
      "The algorithm here is Box Least Squares, the workhorse of transit searching. It assumes a transit looks like a box: flat, then down for a few hours, then flat again.",
      "So it guesses. For every candidate period, every candidate duration, and every candidate starting phase, it folds the light curve — stacks all the data as though that period were correct — and asks: are the points inside the box measurably fainter than the points outside it?",
      "The score is signal-to-noise: the dip's depth divided by how much the depth could be a fluke of the scatter. Crucially, folding N points together shrinks the noise by √N. That's the whole trick — a dip too shallow to see in one transit becomes unmissable when you stack fifty of them.",
      "The run you just watched tested tens of thousands of combinations and kept the best. That is machine learning in its most honest form: no training data, no weights, just a model of what the signal should look like and an exhaustive search for the best fit.",
    ],
  },
  {
    title: "4. Where neural networks come in",
    body: [
      "BLS is good at finding periodic dips. It is not good at telling a planet from an impostor — an eclipsing binary star, a background star bleeding into the aperture, a spacecraft artifact. Kepler produced thousands of candidates, and humans had to vet each one by eye.",
      "So NASA trained convolutional neural networks on the candidates humans had already labelled. Google's AstroNet (Shallue & Vanderburg, 2018) took the folded light curve as an image and learned to classify it as planet or false positive — and it found two genuine planets, Kepler-80 g and Kepler-90 i, that the existing pipeline had thrown away.",
      "Note the division of labour: the search is still a physics model, because you know exactly what shape you're looking for. The classifier is learned, because \"does this look like the false positives humans rejected\" is a pattern nobody can write down as an equation. That combination — hand-built model where you understand the physics, learned model where you don't — is how most real scientific ML works.",
    ],
  },
  {
    title: "5. Why your eyes lost on the last one",
    body: [
      "On Kepler-1 b you probably beat the computer: a 1.4% dip against a 50 ppm noise floor is unmissable. That is a signal-to-noise ratio of nearly 300 in a single transit.",
      "On Kepler-4 b, the dip is 728 ppm against ~73 ppm of scatter — about 10:1 in a single transit, and spread over four hours so no individual point drops far. Your eye evaluates points locally, so it struggles. The algorithm folds four transits together, gains a factor of two on the noise, and reports it without difficulty.",
      "Now scale that up: TESS is currently monitoring hundreds of thousands of stars. Nobody is looking at those charts. This is the only way the search happens at all.",
    ],
  },
];

export default function TransitExplainer() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <h2 className="text-sm font-medium text-neutral-200">
        How machines find planets
      </h2>
      <p className="text-xs text-neutral-500">
        The five things worth understanding about what you just did.
      </p>

      <div className="mt-1 flex flex-col gap-1">
        {SECTIONS.map((s, i) => {
          const isOpen = open === i;
          return (
            <div key={s.title} className="rounded-lg bg-white/5">
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-neutral-300 hover:text-neutral-100"
              >
                <span>{s.title}</span>
                <span className="shrink-0 text-neutral-600">
                  {isOpen ? "−" : "+"}
                </span>
              </button>
              {isOpen && (
                <div className="flex flex-col gap-2 px-3 pb-3">
                  {s.body.map((p, j) => (
                    <p key={j} className="text-xs leading-relaxed text-neutral-500">
                      {p}
                    </p>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-1 text-xs text-neutral-600">
        Data: Kepler long-cadence PDCSAP photometry from the MAST archive.
        Transit parameters from the NASA Exoplanet Archive KOI table.
      </p>
    </div>
  );
}
