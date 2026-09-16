"use client";

import { useMemo } from "react";
import { Line } from "@react-three/drei";

export default function OrbitRing({ radius }: { radius: number }) {
  const points = useMemo(() => {
    const pts: [number, number, number][] = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const a = (i / segments) * Math.PI * 2;
      pts.push([Math.cos(a) * radius, 0, Math.sin(a) * radius]);
    }
    return pts;
  }, [radius]);

  return <Line points={points} color="#3f3f55" transparent opacity={0.5} />;
}
