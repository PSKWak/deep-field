"use client";

import { useEffect, useState } from "react";
import type { PlanetData } from "@/lib/planets";
import { getEarthDayLengthHours, getPlanetLocalTime } from "@/lib/planets";

export default function PlanetInfoPanel({ planet }: { planet: PlanetData }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, [planet.id]);

  const dayHours = getEarthDayLengthHours(planet);
  const years = (planet.orbitalPeriodDays / 365.25).toFixed(2);

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <div className="flex items-baseline justify-between">
        <h2 className="text-sm font-medium text-neutral-100">{planet.name}</h2>
        <span className="font-mono text-lg text-indigo-300">
          {now ? getPlanetLocalTime(planet, now) : "--:--"}
        </span>
      </div>
      <p className="text-xs text-neutral-500">
        Approximate local time, derived from {planet.name}&apos;s real rotation
        period.
      </p>

      <dl className="mt-1 grid grid-cols-2 gap-x-2 gap-y-1 text-xs text-neutral-400">
        <dt className="text-neutral-500">Distance from Sun</dt>
        <dd>{planet.distanceAu.toFixed(2)} AU</dd>

        <dt className="text-neutral-500">Day length</dt>
        <dd>
          {dayHours < 48
            ? `${dayHours.toFixed(1)} hours`
            : `${(dayHours / 24).toFixed(1)} days`}
        </dd>

        <dt className="text-neutral-500">Year length</dt>
        <dd>{years} Earth years</dd>

        <dt className="text-neutral-500">Radius</dt>
        <dd>{Math.round(planet.radiusKm).toLocaleString()} km</dd>

        <dt className="text-neutral-500">Axial tilt</dt>
        <dd>{planet.axialTiltDeg.toFixed(1)}°</dd>

        <dt className="text-neutral-500">Moons</dt>
        <dd>{planet.moons}</dd>
      </dl>

      <p className="mt-1 border-t border-white/10 pt-2 text-xs text-neutral-400">
        {planet.fact}
      </p>
    </div>
  );
}
