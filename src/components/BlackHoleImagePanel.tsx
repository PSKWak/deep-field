"use client";

import { REAL_BLACK_HOLE_IMAGES } from "@/lib/blackHoleImages";
import type { BlackHoleTypeId } from "@/lib/blackHoleTypes";

export default function BlackHoleImagePanel({
  type,
}: {
  type: BlackHoleTypeId;
}) {
  if (type !== "supermassive") {
    return (
      <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
        <h2 className="text-sm font-medium text-neutral-200">Real images</h2>
        <p className="text-xs text-neutral-500">
          No black hole at this mass scale has ever been directly
          photographed — only two supermassive black holes have, both by the
          Event Horizon Telescope. Select &quot;Supermassive&quot; to see
          them.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <h2 className="text-sm font-medium text-neutral-200">
        Real black hole photos
      </h2>
      {REAL_BLACK_HOLE_IMAGES.map((img) => (
        <div key={img.url} className="flex flex-col gap-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img.url}
            alt={img.title}
            className="w-full rounded-lg object-cover"
          />
          <p className="text-xs font-medium text-neutral-300">{img.title}</p>
          <p className="text-xs text-neutral-500">{img.caption}</p>
          <a
            href={img.sourcePage}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-indigo-400 hover:text-indigo-300"
          >
            Credit: {img.credit}
          </a>
        </div>
      ))}
    </div>
  );
}
