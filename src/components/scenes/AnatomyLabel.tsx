"use client";

import { useState } from "react";
import { Html } from "@react-three/drei";
import type { AnatomyPart } from "@/lib/blackHoleAnatomy";

type AnatomyLabelProps = {
  part: AnatomyPart;
  position: [number, number, number];
  align?: "left" | "right";
};

export default function AnatomyLabel({
  part,
  position,
  align = "left",
}: AnatomyLabelProps) {
  const [open, setOpen] = useState(false);

  return (
    <Html position={position} center zIndexRange={[10, 0]} occlude={false}>
      <div
        className={`pointer-events-auto flex select-none flex-col gap-1 ${
          align === "right" ? "items-end" : "items-start"
        }`}
        style={{ width: "max-content" }}
      >
        <button
          onClick={() => setOpen((v) => !v)}
          className={`flex items-center gap-1.5 rounded-md border border-white/10 px-2 py-1 text-[11px] font-medium text-white shadow-lg backdrop-blur-sm transition-colors ${
            open ? "bg-indigo-500/90" : "bg-black/70 hover:bg-black/85"
          }`}
        >
          {part.label}
          <span className="flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white/20 text-[10px] leading-none">
            {open ? "−" : "+"}
          </span>
        </button>

        {open && (
          <p className="w-56 rounded-md border border-white/10 bg-black/85 p-2 text-[11px] leading-snug text-neutral-300 shadow-xl backdrop-blur-sm">
            {part.description}
          </p>
        )}
      </div>
    </Html>
  );
}
