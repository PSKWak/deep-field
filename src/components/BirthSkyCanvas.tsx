"use client";

import { useEffect, useRef } from "react";
import type { SkyResult } from "@/lib/birthSky";

export type SkyCaption = {
  title: string;
  subtitle: string;
  detail: string;
};

type BirthSkyCanvasProps = {
  sky: SkyResult;
  caption: SkyCaption;
  showConstellations: boolean;
  showLabels: boolean;
  /** receives the canvas so the parent can export it as a PNG */
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
};

const SIZE = 720;
const CAPTION_H = 132;
const MARGIN = 34;

/** Dot radius in px from visual magnitude: Sirius (-1.5) big, mag 4 barely there. */
function starRadius(mag: number): number {
  return Math.max(0.55, 2.9 - mag * 0.52);
}

function starAlpha(mag: number): number {
  return Math.max(0.3, Math.min(1, 1.12 - mag * 0.14));
}

const PLANET_COLORS: Record<string, string> = {
  Mercury: "#cbd5e1",
  Venus: "#fde68a",
  Mars: "#f87171",
  Jupiter: "#fcd34d",
  Saturn: "#fbbf24",
  Uranus: "#7dd3fc",
  Neptune: "#818cf8",
  Moon: "#e2e8f0",
  Sun: "#fbbf24",
};

export default function BirthSkyCanvas({
  sky,
  caption,
  showConstellations,
  showLabels,
  canvasRef,
}: BirthSkyCanvasProps) {
  const localRef = useRef<HTMLCanvasElement>(null);
  const ref = canvasRef ?? localRef;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Render at 2x so the exported PNG stays crisp.
    const dpr = 2;
    const w = SIZE;
    const h = SIZE + CAPTION_H;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.aspectRatio = `${w} / ${h}`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w / 2;
    const cy = SIZE / 2;
    const R = SIZE / 2 - MARGIN;
    const toPx = (x: number, y: number) => ({
      px: cx + x * R,
      // Canvas y grows downward; the projection has y up (north).
      py: cy - y * R,
    });

    ctx.fillStyle = "#04060f";
    ctx.fillRect(0, 0, w, h);

    // Sky disk, slightly lighter toward the zenith.
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R);
    grad.addColorStop(0, "#0d1530");
    grad.addColorStop(1, "#06080f");
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    // Altitude rings at 30 and 60 degrees.
    ctx.strokeStyle = "rgba(255,255,255,0.055)";
    ctx.lineWidth = 1;
    for (const alt of [30, 60]) {
      ctx.beginPath();
      ctx.arc(cx, cy, R * ((90 - alt) / 90), 0, Math.PI * 2);
      ctx.stroke();
    }

    // Horizon rim.
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = "rgba(255,255,255,0.18)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Cardinal points. Azimuth 0 = north = up; east is 90 deg, drawn to the
    // left because we are looking up at the sky, not down at a map.
    ctx.font = "500 12px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const [label, az] of [
      ["N", 0],
      ["E", 90],
      ["S", 180],
      ["W", 270],
    ] as const) {
      const theta = (az * Math.PI) / 180;
      const { px, py } = toPx(
        ((R + 18) / R) * Math.sin(theta),
        ((R + 18) / R) * Math.cos(theta)
      );
      ctx.fillText(label, px, py);
    }

    if (showConstellations) {
      ctx.strokeStyle = "rgba(129,140,248,0.34)";
      ctx.lineWidth = 0.9;
      for (const fig of sky.figures) {
        for (const s of fig.segments) {
          const a = toPx(s.x1, s.y1);
          const b = toPx(s.x2, s.y2);
          ctx.beginPath();
          ctx.moveTo(a.px, a.py);
          ctx.lineTo(b.px, b.py);
          ctx.stroke();
        }
      }
    }

    for (const star of sky.stars) {
      const { px, py } = toPx(star.x, star.y);
      const r = starRadius(star.mag);
      // A soft halo on the brightest stars so they read as bright, not just big.
      if (star.mag < 1.6) {
        const halo = ctx.createRadialGradient(px, py, 0, px, py, r * 4);
        halo.addColorStop(0, "rgba(255,255,255,0.32)");
        halo.addColorStop(1, "rgba(255,255,255,0)");
        ctx.beginPath();
        ctx.arc(px, py, r * 4, 0, Math.PI * 2);
        ctx.fillStyle = halo;
        ctx.fill();
      }
      ctx.beginPath();
      ctx.arc(px, py, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(248,250,252,${starAlpha(star.mag)})`;
      ctx.fill();
    }

    // Named bright stars.
    if (showLabels) {
      ctx.font = "400 10px ui-sans-serif, system-ui, sans-serif";
      ctx.fillStyle = "rgba(226,232,240,0.62)";
      ctx.textAlign = "left";
      for (const star of sky.stars) {
        if (!star.label || star.mag > 1.6) continue;
        const { px, py } = toPx(star.x, star.y);
        ctx.fillText(star.label, px + 6, py);
      }
    }

    const drawBody = (
      x: number,
      y: number,
      label: string,
      radius: number,
      color: string
    ) => {
      const { px, py } = toPx(x, y);
      const halo = ctx.createRadialGradient(px, py, 0, px, py, radius * 3.6);
      halo.addColorStop(0, `${color}66`);
      halo.addColorStop(1, `${color}00`);
      ctx.beginPath();
      ctx.arc(px, py, radius * 3.6, 0, Math.PI * 2);
      ctx.fillStyle = halo;
      ctx.fill();

      ctx.beginPath();
      ctx.arc(px, py, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();

      if (showLabels) {
        ctx.font = "500 11px ui-sans-serif, system-ui, sans-serif";
        ctx.fillStyle = color;
        ctx.textAlign = "left";
        ctx.fillText(label, px + radius + 5, py);
      }
    };

    for (const p of sky.planets) {
      drawBody(p.x, p.y, p.body, 3, PLANET_COLORS[p.body] ?? "#e2e8f0");
    }
    if (sky.moon.altitude > 0) {
      drawBody(sky.moon.x, sky.moon.y, "Moon", 6, PLANET_COLORS.Moon);
    }
    if (sky.sun.altitude > 0) {
      drawBody(sky.sun.x, sky.sun.y, "Sun", 8, PLANET_COLORS.Sun);
    }

    // Caption block, part of the image so a saved PNG stands on its own.
    const baseY = SIZE + 6;
    ctx.textAlign = "center";
    ctx.textBaseline = "alphabetic";

    ctx.font = "600 22px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "#f1f5f9";
    ctx.fillText(caption.title, cx, baseY + 22);

    ctx.font = "400 13px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "rgba(226,232,240,0.72)";
    ctx.fillText(caption.subtitle, cx, baseY + 44);

    // Wrap the detail line to the canvas width.
    ctx.font = "400 11px ui-sans-serif, system-ui, sans-serif";
    ctx.fillStyle = "rgba(148,163,184,0.85)";
    const maxWidth = w - 80;
    const words = caption.detail.split(" ");
    const lines: string[] = [];
    let line = "";
    for (const word of words) {
      const candidate = line ? `${line} ${word}` : word;
      if (ctx.measureText(candidate).width > maxWidth && line) {
        lines.push(line);
        line = word;
      } else {
        line = candidate;
      }
    }
    if (line) lines.push(line);
    lines.slice(0, 4).forEach((l, i) => {
      ctx.fillText(l, cx, baseY + 66 + i * 15);
    });
  }, [sky, caption, showConstellations, showLabels, ref]);

  return (
    <canvas
      ref={ref}
      className="w-full rounded-lg"
      style={{ aspectRatio: `${SIZE} / ${SIZE + CAPTION_H}` }}
    />
  );
}
