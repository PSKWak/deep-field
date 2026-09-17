"use client";

import { useEffect, useRef, useState } from "react";
import { placeLabel, searchPlaces, type Place } from "@/lib/geocode";

type CitySearchProps = {
  /** label of the currently chosen place, shown when the box is empty */
  current: string;
  onSelect: (place: Place) => void;
};

export default function CitySearch({ current, onSelect }: CitySearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);

  // Debounced lookup; the abort controller drops responses for queries the
  // user has already typed past, which otherwise arrive out of order.
  useEffect(() => {
    // Too short to search: nothing to schedule. The stale results from a
    // longer query are filtered out below rather than cleared here, so this
    // effect never has to set state synchronously.
    if (query.trim().length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setLoading(true);
      searchPlaces(query, controller.signal)
        .then((places) => {
          setResults(places);
          setHighlight(0);
          setError(places.length === 0 ? "No matching place found." : null);
        })
        .catch((err) => {
          if (err.name === "AbortError") return;
          setError("Couldn't reach the place search.");
        })
        .finally(() => {
          if (!controller.signal.aborted) setLoading(false);
        });
    }, 300);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  useEffect(() => {
    function onDocPointerDown(e: PointerEvent) {
      if (!boxRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onDocPointerDown);
    return () => document.removeEventListener("pointerdown", onDocPointerDown);
  }, []);

  function choose(place: Place) {
    onSelect(place);
    setQuery("");
    setResults([]);
    setOpen(false);
  }

  // A query shorter than the search threshold shows nothing, regardless of
  // what the last completed request returned.
  const searchable = query.trim().length >= 2;
  const visible = searchable ? results : [];

  return (
    <div ref={boxRef} className="relative flex flex-col gap-1">
      <label className="text-xs text-neutral-300" htmlFor="city-search">
        Birth city
      </label>
      <input
        id="city-search"
        value={query}
        placeholder={current || "Search any city…"}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!open || visible.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setHighlight((h) => (h + 1) % visible.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setHighlight((h) => (h - 1 + visible.length) % visible.length);
          } else if (e.key === "Enter") {
            e.preventDefault();
            choose(visible[highlight]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        className="rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-neutral-200 placeholder:text-neutral-500 focus:border-indigo-400 focus:outline-none"
      />

      {loading && searchable && (
        <span className="text-xs text-neutral-600">Searching…</span>
      )}
      {error && !loading && searchable && (
        <span className="text-xs text-amber-400">{error}</span>
      )}

      {open && visible.length > 0 && (
        <ul className="absolute left-0 right-0 top-full z-50 mt-1 max-h-56 overflow-y-auto rounded-lg border border-white/10 bg-neutral-950/95 py-1 backdrop-blur-md">
          {visible.map((p, i) => (
            <li key={p.id}>
              <button
                onMouseEnter={() => setHighlight(i)}
                onClick={() => choose(p)}
                className={`flex w-full flex-col gap-0.5 px-3 py-1.5 text-left text-xs ${
                  i === highlight ? "bg-indigo-500/25" : "hover:bg-white/5"
                }`}
              >
                <span className="text-neutral-200">{placeLabel(p)}</span>
                <span className="text-neutral-500">
                  {p.latitude.toFixed(2)}°, {p.longitude.toFixed(2)}° ·{" "}
                  {p.timezone}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
