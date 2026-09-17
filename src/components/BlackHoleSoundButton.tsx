"use client";

import { useEffect, useRef, useState } from "react";

const SONIFICATION_URL =
  "https://chandra.si.edu/sound/sounds/perseus_sonification.mp4";
const SOURCE_PAGE = "https://chandra.si.edu/sound/perseus.html";

/**
 * Top-bar toggle for NASA's Perseus cluster sonification. This owns the only
 * <audio> element for it, so the sound can't end up playing twice from two
 * different controls.
 */
export default function BlackHoleSoundButton({ active }: { active: boolean }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  // Leaving Black Holes mode should stop the sound rather than leave it
  // playing over an unrelated scene.
  useEffect(() => {
    if (active) return;
    const audio = audioRef.current;
    if (audio && !audio.paused) audio.pause();
  }, [active]);

  function toggle() {
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
  }

  return (
    <div className="relative">
      <button
        onClick={toggle}
        aria-pressed={playing}
        title="Real sound from the Perseus cluster black hole (NASA/Chandra)"
        className={`flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs backdrop-blur-md transition-colors ${
          playing
            ? "border-indigo-400/50 bg-indigo-500/20 text-indigo-200"
            : "border-white/10 bg-black/40 text-neutral-300 hover:bg-black/60"
        }`}
      >
        <span aria-hidden>{playing ? "🔊" : "🔈"}</span>
        {loading ? "Loading…" : playing ? "Playing" : "Hear it"}
      </button>

      {/* Attribution surfaces while the sound is actually in use. */}
      {(playing || error) && (
        <div className="absolute right-0 top-9 z-50 w-64 max-w-[80vw] rounded-xl border border-white/10 bg-black/90 p-3 text-left backdrop-blur-md">
          {error ? (
            <p className="text-xs text-amber-400">
              Couldn&apos;t load the audio right now.
            </p>
          ) : (
            <>
              <p className="text-xs leading-relaxed text-neutral-400">
                Real pressure waves detected around the Perseus cluster black
                hole by NASA&apos;s Chandra X-ray Observatory, resynthesized
                about 57 octaves up into human hearing range.
              </p>
              <a
                href={SOURCE_PAGE}
                target="_blank"
                rel="noreferrer"
                className="mt-1.5 block text-xs text-indigo-400 hover:text-indigo-300"
              >
                NASA/CXC/SAO, K. Arcand, SYSTEM Sounds — chandra.si.edu
              </a>
            </>
          )}
        </div>
      )}

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
