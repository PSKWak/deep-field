"use client";

import { useRef, useState } from "react";

const SONIFICATION_URL =
  "https://chandra.si.edu/sound/sounds/perseus_sonification.mp4";
const SOURCE_PAGE = "https://chandra.si.edu/sound/perseus.html";

export default function BlackHoleAudio() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) {
      audio.pause();
      setPlaying(false);
      return;
    }
    setLoading(true);
    setError(false);
    audio
      .play()
      .then(() => {
        setPlaying(true);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        setError(true);
      });
  };

  return (
    <div className="flex flex-col gap-2 rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-md">
      <h2 className="text-sm font-medium text-neutral-200">
        NASA black hole sound
      </h2>
      <p className="text-xs text-neutral-500">
        Real pressure waves detected around the Perseus cluster black hole by
        NASA&apos;s Chandra X-ray Observatory, resynthesized ~57 octaves up
        into human hearing range.
      </p>

      <button
        onClick={toggle}
        className="self-start rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-neutral-200 hover:bg-white/10"
      >
        {loading ? "Loading…" : playing ? "Pause" : "Play sound"}
      </button>

      {error && (
        <p className="text-xs text-neutral-500">
          Couldn&apos;t load the audio right now.
        </p>
      )}

      <a
        href={SOURCE_PAGE}
        target="_blank"
        rel="noreferrer"
        className="text-xs text-indigo-400 hover:text-indigo-300"
      >
        Source: NASA/CXC/SAO, K. Arcand, SYSTEM Sounds — chandra.si.edu
      </a>

      <audio
        ref={audioRef}
        src={SONIFICATION_URL}
        preload="none"
        loop
        onEnded={() => setPlaying(false)}
      />
    </div>
  );
}
