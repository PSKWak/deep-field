"use client";

import type { BlackHoleTypeData } from "@/lib/blackHoleTypes";

export default function BlackHoleInfoPanel({
  type,
}: {
  type: BlackHoleTypeData;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <h2 className="text-sm font-medium text-neutral-100">
        {type.name} black hole
      </h2>

      <dl className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 text-xs text-neutral-400">
        <dt className="text-neutral-500">Mass</dt>
        <dd>{type.massRange}</dd>
        <dt className="text-neutral-500">Example</dt>
        <dd>{type.example}</dd>
      </dl>

      <p className="mt-1 text-xs text-neutral-400">{type.description}</p>
      <p className="border-t border-white/10 pt-2 text-xs text-neutral-400">
        {type.fact}
      </p>

      <a
        href="https://science.nasa.gov/universe/black-holes/types/"
        target="_blank"
        rel="noreferrer"
        className="text-xs text-indigo-400 hover:text-indigo-300"
      >
        Source: NASA Science — Types of Black Holes
      </a>
    </div>
  );
}
