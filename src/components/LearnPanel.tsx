"use client";

import { useState } from "react";
import ExoplanetLabPanel from "./ExoplanetLabPanel";
import TransitExplainer from "./TransitExplainer";
import BirthSkyPanel from "./BirthSkyPanel";

type Tab = "exoplanets" | "sky";

const TABS: { id: Tab; label: string }[] = [
  { id: "exoplanets", label: "Exoplanet Lab" },
  { id: "sky", label: "Your Sky" },
];

type LearnPanelProps = {
  onOpenChat: () => void;
};

export default function LearnPanel({ onOpenChat }: LearnPanelProps) {
  const [tab, setTab] = useState<Tab>("exoplanets");

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-1 rounded-xl border border-white/10 bg-black/40 p-1 backdrop-blur-md">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 rounded-lg px-3 py-1.5 text-xs transition-colors ${
              tab === t.id
                ? "bg-indigo-500 text-white"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {t.label}
          </button>
        ))}
        <button
          onClick={onOpenChat}
          className="flex-1 rounded-lg px-3 py-1.5 text-xs text-neutral-400 transition-colors hover:text-neutral-200"
        >
          Ask
        </button>
      </div>

      {tab === "exoplanets" && (
        <>
          <ExoplanetLabPanel />
          <TransitExplainer />
        </>
      )}
      {tab === "sky" && <BirthSkyPanel />}
    </div>
  );
}
