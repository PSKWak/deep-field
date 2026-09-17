"use client";

import { useCallback, useMemo, useState } from "react";
import LightCurveChart from "./LightCurveChart";
import { TARGETS, transitCenters } from "@/lib/exoplanetData";
import { searchTransit, type Detection } from "@/lib/transitDetector";

type Phase = "hunting" | "searching" | "revealed";

/** A guess counts as a hit if it lands within this fraction of a day of a
 * real transit mid-time — roughly "you pointed at the right dip". */
const HIT_TOLERANCE_DAYS = 0.25;

export default function ExoplanetLabPanel() {
  const [targetIndex, setTargetIndex] = useState(0);
  const [guesses, setGuesses] = useState<number[]>([]);
  const [phase, setPhase] = useState<Phase>("hunting");
  const [progress, setProgress] = useState(0);
  const [detection, setDetection] = useState<Detection | null>(null);

  const target = TARGETS[targetIndex];
  const truth = useMemo(() => transitCenters(target.curve), [target]);
  const addGuess = useCallback((day: number) => {
    setGuesses((g) => [...g, day]);
  }, []);

  function reset(index: number) {
    setTargetIndex(index);
    setGuesses([]);
    setPhase("hunting");
    setProgress(0);
    setDetection(null);
  }

  async function runDetector() {
    setPhase("searching");
    setProgress(0);
    for await (const step of searchTransit(target.curve)) {
      setProgress(step.progress);
      if (step.detection) setDetection(step.detection);
    }
    setPhase("revealed");
  }

  const score = useMemo(() => {
    if (phase !== "revealed") return null;
    const matched = new Set<number>();
    let hits = 0;
    for (const g of guesses) {
      const i = truth.findIndex(
        (t, idx) => !matched.has(idx) && Math.abs(t - g) <= HIT_TOLERANCE_DAYS
      );
      if (i >= 0) {
        matched.add(i);
        hits++;
      }
    }
    return { hits, total: truth.length, falsePositives: guesses.length - hits };
  }, [phase, guesses, truth]);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <div>
        <h2 className="text-sm font-medium text-neutral-200">Exoplanet Lab</h2>
        <p className="mt-1 text-xs text-neutral-500">
          This is real Kepler photometry. Every dot is a measurement of one
          star&apos;s brightness, taken every 30 minutes. A planet crossing the
          star blocks a sliver of its light — find the dips.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-1">
        {TARGETS.map((t, i) => (
          <button
            key={t.curve.planet}
            onClick={() => reset(i)}
            className={`rounded-md px-2 py-1 text-xs transition-colors ${
              i === targetIndex
                ? "bg-indigo-500 text-white"
                : "bg-white/5 text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {t.curve.planet}
          </button>
        ))}
      </div>

      <LightCurveChart
        curve={target.curve}
        guesses={guesses}
        onGuess={addGuess}
        truth={phase === "revealed" ? truth : null}
        detection={detection}
        disabled={phase !== "hunting"}
      />

      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="text-neutral-500">
          {phase === "hunting"
            ? guesses.length === 0
              ? "Click on the chart wherever you think a transit happens."
              : `${guesses.length} marked`
            : ""}
        </span>
        <span className="ml-auto flex gap-2">
          {guesses.length > 0 && phase === "hunting" && (
            <button
              onClick={() => setGuesses([])}
              className="text-neutral-500 hover:text-neutral-300"
            >
              Clear
            </button>
          )}
          {phase === "hunting" && (
            <button
              onClick={runDetector}
              className="rounded-md bg-indigo-500 px-3 py-1 text-white hover:bg-indigo-400"
            >
              Run the algorithm
            </button>
          )}
          {phase === "revealed" && (
            <button
              onClick={() => reset(targetIndex)}
              className="rounded-md bg-white/10 px-3 py-1 text-neutral-200 hover:bg-white/20"
            >
              Try again
            </button>
          )}
        </span>
      </div>

      {phase === "searching" && (
        <div className="flex flex-col gap-1">
          <div className="h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-indigo-400 transition-[width] duration-100"
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <p className="text-xs text-neutral-500">
            Folding the light curve at every candidate period…
          </p>
        </div>
      )}

      {score && detection && (
        <div className="flex flex-col gap-2 rounded-lg border border-white/10 bg-white/5 p-3">
          <p className="text-xs text-neutral-300">
            You found <span className="text-amber-300">{score.hits}</span> of{" "}
            {score.total} transits
            {score.falsePositives > 0 &&
              ` (${score.falsePositives} mark${
                score.falsePositives === 1 ? "" : "s"
              } didn't land on one)`}
            . The algorithm found{" "}
            <span className="text-indigo-300">
              {detection.transitCenters.length}
            </span>
            .
          </p>
          <dl className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
            <dt className="text-neutral-500">Period it derived</dt>
            <dd className="text-neutral-300">
              {detection.periodDays.toFixed(3)} d
            </dd>
            <dt className="text-neutral-500">Published period</dt>
            <dd className="text-neutral-300">
              {target.curve.periodDays.toFixed(3)} d
            </dd>
            <dt className="text-neutral-500">Depth it measured</dt>
            <dd className="text-neutral-300">
              {detection.depthPpm.toFixed(0)} ppm
            </dd>
            <dt className="text-neutral-500">Published depth</dt>
            <dd className="text-neutral-300">
              {target.curve.depthPpm.toFixed(0)} ppm
            </dd>
            <dt className="text-neutral-500">Signal-to-noise</dt>
            <dd className="text-neutral-300">
              {detection.signalToNoise.toFixed(0)}
            </dd>
            <dt className="text-neutral-500">Search</dt>
            <dd className="text-neutral-300">
              {detection.combinationsTested.toLocaleString()} fits in{" "}
              {(detection.elapsedMs / 1000).toFixed(1)}s
            </dd>
          </dl>
          <p className="text-xs text-neutral-500">
            Green bands are the real transits; dashed indigo lines are where the
            algorithm predicted them. It never saw the answer — it derived the
            period from the data alone.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 border-t border-white/10 pt-3 text-xs text-neutral-500">
        <p>
          <span className="text-neutral-300">{target.curve.planet}</span> —{" "}
          {target.blurb}
        </p>
        <dl className="grid grid-cols-2 gap-x-3 gap-y-0.5">
          <dt>Star</dt>
          <dd className="text-neutral-400">{target.starName}</dd>
          <dt>Kepler ID</dt>
          <dd className="text-neutral-400">KIC {target.curve.kepid}</dd>
          <dt>Planet radius</dt>
          <dd className="text-neutral-400">
            {target.planetRadiusEarths.toFixed(1)}× Earth
          </dd>
          <dt>Transit duration</dt>
          <dd className="text-neutral-400">
            {target.curve.durationHours.toFixed(1)} h
          </dd>
          <dt>Noise floor</dt>
          <dd className="text-neutral-400">
            ±{target.curve.scatterPpm.toFixed(0)} ppm
          </dd>
        </dl>
      </div>
    </div>
  );
}
