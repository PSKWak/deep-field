"use client";

import { useEffect, useState } from "react";
import { fetchApod, type ApodResponse } from "@/lib/nasa";

export default function ApodPanel() {
  const [apod, setApod] = useState<ApodResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchApod()
      .then((data) => {
        if (!cancelled) setApod(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load NASA data");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-neutral-500 backdrop-blur-md">
        NASA data unavailable right now.
      </div>
    );
  }

  if (!apod) {
    return (
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 text-xs text-neutral-500 backdrop-blur-md">
        Loading today&apos;s NASA image…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <h2 className="text-sm font-medium text-neutral-200">
        Astronomy Picture of the Day
      </h2>
      {apod.media_type === "image" && (
        <img
          src={apod.url}
          alt={apod.title}
          className="w-full rounded-lg object-cover"
        />
      )}
      <p className="text-xs font-medium text-neutral-300">{apod.title}</p>
      <p
        className={`text-xs text-neutral-500 ${
          expanded ? "" : "line-clamp-3"
        }`}
      >
        {apod.explanation}
      </p>
      <button
        onClick={() => setExpanded((v) => !v)}
        className="self-start text-xs text-indigo-400 hover:text-indigo-300"
      >
        {expanded ? "Show less" : "Read more"}
      </button>
    </div>
  );
}
