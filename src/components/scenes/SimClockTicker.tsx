"use client";

import { useFrame } from "@react-three/fiber";

type SimClockTickerProps = {
  simTimeRef: React.RefObject<number>;
  timeScale: number;
};

/** Advances the shared sim-time ref each frame; lives inside the Canvas so
 * it can use useFrame, while the ref itself is created and read outside. */
export default function SimClockTicker({
  simTimeRef,
  timeScale,
}: SimClockTickerProps) {
  useFrame((_, delta) => {
    simTimeRef.current += delta * timeScale * 86_400_000;
  });
  return null;
}
