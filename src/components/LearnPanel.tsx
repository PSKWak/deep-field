"use client";

import ExoplanetLabPanel from "./ExoplanetLabPanel";
import TransitExplainer from "./TransitExplainer";
import BirthSkyPanel from "./BirthSkyPanel";

export type LearnTab = "exoplanets" | "sky";

const TABS: { id: LearnTab; label: string }[] = [
  { id: "exoplanets", label: "Exoplanet Lab" },
  { id: "sky", label: "Your Sky" },
];

type LearnPanelProps = {
  tab: LearnTab;
  onTabChange: (tab: LearnTab) => void;
  onOpenChat: () => void;
  onExit: () => void;
};

export default function LearnPanel({
  tab,
  onTabChange,
  onOpenChat,
  onExit,
}: LearnPanelProps) {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-1 gap-1 rounded-xl border border-white/10 bg-black/50 p-1 backdrop-blur-md">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => onTabChange(t.id)}
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

        {/* An exit that does not depend on reaching the mode tabs. */}
        <button
          onClick={onExit}
          className="shrink-0 rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-xs text-neutral-300 backdrop-blur-md hover:bg-black/70"
        >
          ← Back to the explorer
        </button>
      </div>

      {tab === "exoplanets" && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <div className="min-w-0 flex-1">
            <ExoplanetLabPanel />
          </div>
          <div className="w-full lg:w-[22rem] lg:shrink-0">
            <TransitExplainer />
          </div>
        </div>
      )}
      {tab === "sky" && <BirthSkyPanel />}
    </div>
  );
}
