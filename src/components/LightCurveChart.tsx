"use client";

import { memo, useMemo, useRef, useState } from "react";
import type { LightCurve } from "@/lib/exoplanetData";
import type { Detection } from "@/lib/transitDetector";

const WIDTH = 900;
const HEIGHT = 300;
const PAD = { left: 58, right: 14, top: 16, bottom: 32 };

type LightCurveChartProps = {
  curve: LightCurve;
  /** user's clicked guesses, in days */
  guesses: number[];
  onGuess: (day: number) => void;
  /** ground-truth transit mid-times, revealed after the user submits */
  truth: number[] | null;
  detection: Detection | null;
  disabled: boolean;
};

/** Memoized: the search yields progress many times a second, and re-rendering
 * several hundred SVG points on each tick is what makes it feel slow. */
function LightCurveChart({
  curve,
  guesses,
  onGuess,
  truth,
  detection,
  disabled,
}: LightCurveChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverDay, setHoverDay] = useState<number | null>(null);

  const scale = useMemo(() => {
    const xMin = curve.days[0];
    const xMax = curve.days[curve.days.length - 1];
    let yMin = Infinity;
    let yMax = -Infinity;
    for (const f of curve.flux) {
      if (f < yMin) yMin = f;
      if (f > yMax) yMax = f;
    }
    // Pad the flux range slightly so the deepest points aren't on the axis.
    const margin = (yMax - yMin) * 0.12;
    yMin -= margin;
    yMax += margin;

    const plotW = WIDTH - PAD.left - PAD.right;
    const plotH = HEIGHT - PAD.top - PAD.bottom;
    return {
      xMin,
      xMax,
      yMin,
      yMax,
      x: (d: number) => PAD.left + ((d - xMin) / (xMax - xMin)) * plotW,
      y: (f: number) => PAD.top + ((yMax - f) / (yMax - yMin)) * plotH,
      dayAt: (px: number) =>
        xMin + ((px - PAD.left) / plotW) * (xMax - xMin),
    };
  }, [curve]);

  const points = useMemo(
    () =>
      curve.days.map((d, i) => ({
        cx: scale.x(d),
        cy: scale.y(curve.flux[i]),
      })),
    [curve, scale]
  );

  const yTicks = useMemo(() => {
    const ticks: number[] = [];
    const steps = 4;
    for (let i = 0; i <= steps; i++) {
      ticks.push(scale.yMin + ((scale.yMax - scale.yMin) * i) / steps);
    }
    return ticks;
  }, [scale]);

  const xTicks = useMemo(() => {
    const ticks: number[] = [];
    for (let d = 0; d <= scale.xMax; d += 2) ticks.push(d);
    return ticks;
  }, [scale]);

  function pointerDay(e: React.PointerEvent<SVGSVGElement>): number | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    // The SVG scales to its container, so map client px back to viewBox units.
    const px = ((e.clientX - rect.left) / rect.width) * WIDTH;
    if (px < PAD.left || px > WIDTH - PAD.right) return null;
    return scale.dayAt(px);
  }

  const transitWidthDays = curve.durationHours / 24;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={`w-full select-none rounded-lg bg-black/40 ${
        disabled ? "" : "cursor-crosshair"
      }`}
      onPointerMove={(e) => setHoverDay(pointerDay(e))}
      onPointerLeave={() => setHoverDay(null)}
      onPointerDown={(e) => {
        if (disabled) return;
        const day = pointerDay(e);
        if (day !== null) onGuess(day);
      }}
    >
      {/* y grid + labels (relative flux) */}
      {yTicks.map((f) => (
        <g key={f}>
          <line
            x1={PAD.left}
            x2={WIDTH - PAD.right}
            y1={scale.y(f)}
            y2={scale.y(f)}
            stroke="rgba(255,255,255,0.06)"
          />
          <text
            x={PAD.left - 6}
            y={scale.y(f) + 3}
            textAnchor="end"
            className="fill-neutral-600"
            style={{ fontSize: 12 }}
          >
            {((f - 1) * 1e6).toFixed(0)}
          </text>
        </g>
      ))}
      <text
        x={14}
        y={HEIGHT / 2}
        transform={`rotate(-90 14 ${HEIGHT / 2})`}
        textAnchor="middle"
        className="fill-neutral-500"
        style={{ fontSize: 12 }}
      >
        brightness change (ppm)
      </text>

      {/* x labels (days) */}
      {xTicks.map((d) => (
        <text
          key={d}
          x={scale.x(d)}
          y={HEIGHT - 12}
          textAnchor="middle"
          className="fill-neutral-600"
          style={{ fontSize: 12 }}
        >
          {d}
        </text>
      ))}
      <text
        x={WIDTH - PAD.right}
        y={HEIGHT - 2}
        textAnchor="end"
        className="fill-neutral-600"
        style={{ fontSize: 12 }}
      >
        days
      </text>

      {/* revealed truth bands */}
      {truth?.map((t, i) => (
        <rect
          key={`truth-${i}`}
          x={scale.x(t - transitWidthDays / 2)}
          width={Math.max(
            2,
            scale.x(t + transitWidthDays / 2) - scale.x(t - transitWidthDays / 2)
          )}
          y={PAD.top}
          height={HEIGHT - PAD.top - PAD.bottom}
          fill="rgba(52,211,153,0.16)"
        />
      ))}

      {/* detector's predicted transit centres */}
      {detection?.transitCenters.map((t, i) => (
        <line
          key={`det-${i}`}
          x1={scale.x(t)}
          x2={scale.x(t)}
          y1={PAD.top}
          y2={HEIGHT - PAD.bottom}
          stroke="rgb(129,140,248)"
          strokeWidth={1}
          strokeDasharray="3 2"
        />
      ))}

      {/* the photometry */}
      {points.map((p, i) => (
        <circle key={i} cx={p.cx} cy={p.cy} r={1.5} fill="rgba(226,232,240,0.78)" />
      ))}

      {/* user guesses */}
      {guesses.map((g, i) => (
        <g key={`guess-${i}`}>
          <line
            x1={scale.x(g)}
            x2={scale.x(g)}
            y1={PAD.top}
            y2={HEIGHT - PAD.bottom}
            stroke="rgb(251,191,36)"
            strokeWidth={1.5}
          />
          <circle cx={scale.x(g)} cy={PAD.top + 5} r={4} fill="rgb(251,191,36)" />
        </g>
      ))}

      {/* hover readout */}
      {hoverDay !== null && !disabled && (
        <line
          x1={scale.x(hoverDay)}
          x2={scale.x(hoverDay)}
          y1={PAD.top}
          y2={HEIGHT - PAD.bottom}
          stroke="rgba(255,255,255,0.25)"
          strokeWidth={1}
        />
      )}
    </svg>
  );
}

export default memo(LightCurveChart);
