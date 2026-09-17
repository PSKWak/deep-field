"use client";

import { useMemo, useRef, useState } from "react";
import BirthSkyCanvas, { type SkyCaption } from "./BirthSkyCanvas";
import CitySearch from "./CitySearch";
import {
  computeSky,
  describeSky,
  zonedTimeToUtc,
  zoneLabel,
} from "@/lib/birthSky";
import type { Place } from "@/lib/geocode";

const QUICK_PLACES = [
  { name: "Mumbai, India", lat: 19.076, lon: 72.8777, tz: "Asia/Kolkata" },
  { name: "London, UK", lat: 51.5074, lon: -0.1278, tz: "Europe/London" },
  { name: "New York, USA", lat: 40.7128, lon: -74.006, tz: "America/New_York" },
  { name: "Tokyo, Japan", lat: 35.6762, lon: 139.6503, tz: "Asia/Tokyo" },
];

const browserZone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

/** The browser's canonical zone list, plus the zones this UI can select.
 * Engines differ on canonical spellings — some list Asia/Calcutta rather than
 * Asia/Kolkata — so a zone we set must be merged in or the <select> would fall
 * back to its first option while the real state said something else. */
function zoneOptions(current: string): string[] {
  const supported = (
    Intl as unknown as { supportedValuesOf?: (k: string) => string[] }
  ).supportedValuesOf;
  const list = supported ? supported("timeZone") : [];
  const merged = new Set(list.length > 0 ? list : ["UTC"]);
  merged.add(current);
  merged.add(browserZone());
  for (const p of QUICK_PLACES) merged.add(p.tz);
  return [...merged].sort();
}

const inputClass =
  "rounded-md border border-white/10 bg-black/40 px-2 py-1.5 text-xs text-neutral-200 [color-scheme:dark] focus:border-indigo-400 focus:outline-none";

export default function BirthSkyPanel() {
  const [name, setName] = useState("");
  const [date, setDate] = useState("2000-01-01");
  const [time, setTime] = useState("21:00");
  const [place, setPlace] = useState("Mumbai, India");
  const [lat, setLat] = useState(19.076);
  const [lon, setLon] = useState(72.8777);
  const [tz, setTz] = useState("Asia/Kolkata");
  const [showConstellations, setShowConstellations] = useState(true);
  const [showLabels, setShowLabels] = useState(true);
  const [locating, setLocating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [locateError, setLocateError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const zones = useMemo(() => zoneOptions(tz), [tz]);
  // The instant is resolved in the *place's* timezone, not the browser's, so
  // "9pm in Mumbai" means 9pm IST wherever the page is being viewed from.
  const moment = useMemo(
    () => zonedTimeToUtc(date, time, tz),
    [date, time, tz]
  );

  const sky = useMemo(() => {
    if (!moment) return null;
    try {
      return computeSky(moment, lat, lon);
    } catch {
      return null;
    }
  }, [moment, lat, lon]);

  const caption: SkyCaption = useMemo(() => {
    if (!moment || !sky) return { title: "", subtitle: "", detail: "" };
    const dateText = moment.toLocaleDateString(undefined, {
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: tz,
    });
    const coords = `${Math.abs(lat).toFixed(2)}°${
      lat >= 0 ? "N" : "S"
    }, ${Math.abs(lon).toFixed(2)}°${lon >= 0 ? "E" : "W"}`;
    return {
      title: name.trim()
        ? `The sky when ${name.trim()} was born`
        : "The sky when you were born",
      subtitle: `${dateText} at ${time} ${zoneLabel(
        moment,
        tz
      )} · ${place} · ${coords}`,
      detail: describeSky(sky),
    };
  }, [moment, sky, name, time, place, lat, lon, tz]);

  function applyPlace(p: {
    name: string;
    lat: number;
    lon: number;
    tz: string;
  }) {
    setPlace(p.name);
    setLat(p.lat);
    setLon(p.lon);
    setTz(p.tz);
  }

  function onCitySelected(p: Place) {
    applyPlace({
      name: [p.name, p.region, p.country].filter(Boolean).join(", "),
      lat: Number(p.latitude.toFixed(4)),
      lon: Number(p.longitude.toFixed(4)),
      tz: p.timezone,
    });
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setLocateError("This browser can't share a location.");
      return;
    }
    setLocating(true);
    setLocateError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        applyPlace({
          name: "your location",
          lat: Number(pos.coords.latitude.toFixed(4)),
          lon: Number(pos.coords.longitude.toFixed(4)),
          tz: browserZone(),
        });
        setLocating(false);
      },
      () => {
        setLocateError("Couldn't get your location — search for a city instead.");
        setLocating(false);
      },
      { timeout: 10000 }
    );
  }

  function savePng() {
    const canvas = canvasRef.current;
    if (!canvas) return;
    setSaving(true);
    canvas.toBlob((blob) => {
      setSaving(false);
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      const slug = (name.trim() || "sky")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-");
      a.href = url;
      a.download = `${slug}-${date}.png`;
      a.click();
      // Revoking synchronously can cancel the download before the browser has
      // read the blob, so let the click settle first.
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }, "image/png");
  }

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      {/* form */}
      <div className="flex w-full flex-col gap-3 rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur-md lg:w-[20rem] lg:shrink-0">
        <div>
          <h2 className="text-sm font-medium text-neutral-200">
            What the Universe looked like when a star like you was born
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Every star where it actually was, computed from catalogue positions
            and planetary ephemerides for your date, time and city.
          </p>
        </div>

        <label className="flex flex-col gap-1 text-xs text-neutral-300">
          Name <span className="text-neutral-600">(optional)</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Pranjal"
            className={`${inputClass} placeholder:text-neutral-600`}
          />
        </label>

        <div className="grid grid-cols-2 gap-2">
          <label className="flex flex-col gap-1 text-xs text-neutral-300">
            Birth date
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1 text-xs text-neutral-300">
            Birth time
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className={inputClass}
            />
          </label>
        </div>

        <CitySearch current={place} onSelect={onCitySelected} />

        <div className="flex flex-wrap gap-1">
          {QUICK_PLACES.map((p) => (
            <button
              key={p.name}
              onClick={() => applyPlace(p)}
              className={`rounded-md px-2 py-1 text-xs transition-colors ${
                place === p.name
                  ? "bg-indigo-500 text-white"
                  : "bg-white/5 text-neutral-400 hover:text-neutral-200"
              }`}
            >
              {p.name.split(",")[0]}
            </button>
          ))}
          <button
            onClick={useMyLocation}
            disabled={locating}
            className="rounded-md px-2 py-1 text-xs text-indigo-400 hover:text-indigo-300 disabled:opacity-50"
          >
            {locating ? "Locating…" : "Use my location"}
          </button>
        </div>
        {locateError && <p className="text-xs text-amber-400">{locateError}</p>}

        <details className="text-xs text-neutral-400">
          <summary className="cursor-pointer text-neutral-500 hover:text-neutral-300">
            Fine-tune coordinates and timezone
          </summary>
          <div className="mt-2 flex flex-col gap-2">
            <div className="grid grid-cols-2 gap-2">
              <label className="flex flex-col gap-1 text-neutral-300">
                Latitude
                <input
                  type="number"
                  value={lat}
                  min={-90}
                  max={90}
                  step={0.01}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= -90 && v <= 90) {
                      setLat(v);
                      setPlace("custom location");
                    }
                  }}
                  className={inputClass}
                />
              </label>
              <label className="flex flex-col gap-1 text-neutral-300">
                Longitude
                <input
                  type="number"
                  value={lon}
                  min={-180}
                  max={180}
                  step={0.01}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= -180 && v <= 180) {
                      setLon(v);
                      setPlace("custom location");
                    }
                  }}
                  className={inputClass}
                />
              </label>
            </div>
            <label className="flex flex-col gap-1 text-neutral-300">
              <span className="flex justify-between">
                <span>Timezone</span>
                {moment && (
                  <span className="text-neutral-500">
                    {zoneLabel(moment, tz)}
                  </span>
                )}
              </span>
              <select
                value={tz}
                onChange={(e) => setTz(e.target.value)}
                className={inputClass}
              >
                {zones.map((z) => (
                  <option key={z} value={z} className="bg-neutral-900">
                    {z}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </details>

        <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-3 text-xs text-neutral-300">
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={showConstellations}
              onChange={(e) => setShowConstellations(e.target.checked)}
              className="accent-indigo-400"
            />
            Constellations
          </label>
          <label className="flex items-center gap-1.5">
            <input
              type="checkbox"
              checked={showLabels}
              onChange={(e) => setShowLabels(e.target.checked)}
              className="accent-indigo-400"
            />
            Labels
          </label>
          <button
            onClick={savePng}
            disabled={saving || !sky}
            className="ml-auto rounded-md bg-indigo-500 px-3 py-1.5 text-white hover:bg-indigo-400 disabled:opacity-60"
          >
            {saving ? "Saving…" : "Save image"}
          </button>
        </div>
      </div>

      {/* chart */}
      <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-xl border border-white/10 bg-black/50 p-4 backdrop-blur-md">
        {sky && moment ? (
          <>
            <div className="mx-auto w-full max-w-[42rem]">
              <BirthSkyCanvas
                sky={sky}
                caption={caption}
                showConstellations={showConstellations}
                showLabels={showLabels}
                canvasRef={canvasRef}
              />
            </div>

            <div className="flex flex-col gap-1.5 border-t border-white/10 pt-3 text-xs text-neutral-500">
              <p>{describeSky(sky)}</p>
              {sky.figures.length > 0 && (
                <p>
                  <span className="text-neutral-400">Overhead: </span>
                  {sky.figures.map((f) => f.name).join(", ")}.
                </p>
              )}
              <p>
                {sky.isNight
                  ? "The Sun was below the horizon, so this is what you could actually have seen."
                  : "The Sun was above the horizon at this moment — these stars were overhead but invisible in daylight."}
              </p>
              <p className="text-neutral-600">
                Zenith at the centre, horizon at the rim, north up and east left
                — as if you were lying on your back looking up. The time is read
                as wall-clock time in {tz} ({zoneLabel(moment, tz)}), with
                historical daylight-saving rules applied. Star positions are
                J2000 catalogue coordinates, which drift under half a degree
                over a lifetime.
              </p>
            </div>
          </>
        ) : (
          <p className="text-xs text-amber-400">
            That date and time couldn&apos;t be read — check the values.
          </p>
        )}
      </div>
    </div>
  );
}
