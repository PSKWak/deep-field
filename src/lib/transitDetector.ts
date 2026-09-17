import type { LightCurve } from "./exoplanetData";

/**
 * A simplified Box Least Squares (BLS) transit search — the same family of
 * algorithm the Kepler and TESS pipelines use to find planets in millions of
 * light curves.
 *
 * The idea: a transit is a box-shaped dip that repeats on a fixed period. So
 * for every candidate (period, duration, phase), fold the light curve on that
 * period and measure how much fainter the in-box points are than the out-of-box
 * points. The combination with the most statistically significant dip wins.
 * No training data and no neural net — an exhaustive search scored by
 * signal-to-noise.
 */

export type Detection = {
  periodDays: number;
  durationHours: number;
  /** depth of the folded dip measured at its core, in parts per million */
  depthPpm: number;
  /** detection significance: dip depth divided by its uncertainty */
  signalToNoise: number;
  /** mid-times of each predicted transit across the observed window */
  transitCenters: number[];
  elapsedMs: number;
  /** number of (period, duration, phase) combinations evaluated */
  combinationsTested: number;
};

const DURATIONS_HOURS = [1, 1.5, 2, 2.5, 3.5, 5];

type Candidate = {
  period: number;
  durationHours: number;
  phase: number;
  snr: number;
};

/** Fold at one period+duration and return the best-scoring phase. */
function bestPhase(
  days: number[],
  flux: number[],
  period: number,
  durationDays: number,
  phaseSteps: number
): { phase: number; snr: number } {
  let bestSnr = 0;
  let bestPhase = 0;
  const half = durationDays / 2;

  for (let s = 0; s < phaseSteps; s++) {
    const phase = (s / phaseSteps) * period;
    let inSum = 0;
    let inCount = 0;
    let outSum = 0;
    let outSumSq = 0;
    let outCount = 0;

    for (let i = 0; i < days.length; i++) {
      const offset = (((days[i] - phase) % period) + period) % period;
      const fromCentre = offset < period - offset ? offset : period - offset;
      const f = flux[i];
      if (fromCentre <= half) {
        inSum += f;
        inCount++;
      } else {
        outSum += f;
        outSumSq += f * f;
        outCount++;
      }
    }

    if (inCount < 4 || outCount < 20) continue;

    const outMean = outSum / outCount;
    const depth = outMean - inSum / inCount;
    if (depth <= 0) continue;

    // Out-of-transit scatter is the noise floor; averaging inCount points
    // shrinks the uncertainty on the in-transit mean by sqrt(inCount).
    const variance = (outSumSq - outCount * outMean * outMean) / (outCount - 1);
    if (variance <= 0) continue;
    const snr = depth / (Math.sqrt(variance) / Math.sqrt(inCount));

    if (snr > bestSnr) {
      bestSnr = snr;
      bestPhase = phase;
    }
  }

  return { phase: bestPhase, snr: bestSnr };
}

/** Depth measured from the core of the dip only, so ingress/egress points
 * don't dilute it the way the full box average does. */
function coreDepth(
  days: number[],
  flux: number[],
  period: number,
  durationDays: number,
  phase: number
): number {
  const core = durationDays * 0.3;
  const half = durationDays / 2;
  let inSum = 0;
  let inCount = 0;
  let outSum = 0;
  let outCount = 0;

  for (let i = 0; i < days.length; i++) {
    const offset = (((days[i] - phase) % period) + period) % period;
    const fromCentre = offset < period - offset ? offset : period - offset;
    if (fromCentre <= core) {
      inSum += flux[i];
      inCount++;
    } else if (fromCentre > half) {
      outSum += flux[i];
      outCount++;
    }
  }

  if (inCount === 0 || outCount === 0) return 0;
  return outSum / outCount - inSum / inCount;
}

type Stage = { from: number; to: number; step: number; phaseSteps: number };

/**
 * Hand control back to the browser so it can paint, without using
 * requestAnimationFrame (which stops firing entirely in a hidden tab) or
 * setTimeout (which browsers clamp to 1s in background tabs). A MessageChannel
 * message is scheduled as an ordinary task and keeps running either way, so a
 * search survives the user switching tabs mid-run.
 */
function yieldToBrowser(): Promise<void> {
  return new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = () => {
      channel.port1.close();
      resolve();
    };
    channel.port2.postMessage(null);
  });
}

/**
 * Run the search, yielding progress so the caller can keep the UI responsive
 * and show how much of the parameter space has been covered. Consume with
 * `for await (const p of searchTransit(curve))`; the final yield carries the
 * detection.
 */
export async function* searchTransit(
  curve: LightCurve,
  onYield: () => Promise<void> = yieldToBrowser
): AsyncGenerator<
  { progress: number; combinationsTested: number; detection?: Detection },
  void
> {
  const started = performance.now();
  const { days, flux } = curve;
  const span = days[days.length - 1] - days[0];

  // Two transits minimum to establish a period at all.
  const minPeriod = 0.8;
  const maxPeriod = span / 2;

  let best: Candidate = {
    period: minPeriod,
    durationHours: DURATIONS_HOURS[0],
    phase: 0,
    snr: 0,
  };
  let combinationsTested = 0;

  const coarse: Stage = {
    from: minPeriod,
    to: maxPeriod,
    step: 0.01,
    phaseSteps: 40,
  };
  const stages: Stage[] = [coarse];

  for (let s = 0; s < stages.length; s++) {
    const stage = stages[s];
    const total = Math.ceil((stage.to - stage.from) / stage.step);
    let done = 0;

    for (let period = stage.from; period <= stage.to; period += stage.step) {
      for (const durationHours of DURATIONS_HOURS) {
        const { phase, snr } = bestPhase(
          days,
          flux,
          period,
          durationHours / 24,
          stage.phaseSteps
        );
        combinationsTested += stage.phaseSteps;
        if (snr > best.snr) best = { period, durationHours, phase, snr };
      }

      done++;
      // Hand control back periodically so the browser can paint.
      if (done % 10 === 0) {
        const stageProgress = done / total;
        const progress = (s + stageProgress) / 2;
        yield { progress, combinationsTested };
        await onYield();
      }
    }

    // After the coarse sweep, refine on a much finer grid around the winner.
    if (s === 0) {
      stages.push({
        from: Math.max(minPeriod, best.period - 0.04),
        to: best.period + 0.04,
        step: 0.001,
        phaseSteps: 240,
      });
    }
  }

  const durationDays = best.durationHours / 24;
  const depth = coreDepth(days, flux, best.period, durationDays, best.phase);

  const transitCenters: number[] = [];
  for (let t = best.phase; t <= days[days.length - 1]; t += best.period) {
    if (t >= days[0]) transitCenters.push(t);
  }

  yield {
    progress: 1,
    combinationsTested,
    detection: {
      periodDays: best.period,
      durationHours: best.durationHours,
      depthPpm: depth * 1e6,
      signalToNoise: best.snr,
      transitCenters,
      elapsedMs: performance.now() - started,
      combinationsTested,
    },
  };
}
