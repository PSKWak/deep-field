"use client";

import { useEffect, useState } from "react";

/**
 * Copies a link to the current view. The hash is also kept in the address bar
 * as the user adjusts things, so a plain browser reload or bookmark restores
 * the same scene without anyone pressing this button.
 */
export default function ShareButton({ hash }: { hash: string }) {
  const [copied, setCopied] = useState(false);

  // replaceState rather than pushState: adjusting a slider shouldn't fill up
  // the back button with hundreds of history entries.
  useEffect(() => {
    const url = `${window.location.pathname}${window.location.search}#${hash}`;
    window.history.replaceState(null, "", url);
  }, [hash]);

  useEffect(() => {
    if (!copied) return;
    const id = setTimeout(() => setCopied(false), 1800);
    return () => clearTimeout(id);
  }, [copied]);

  async function copy() {
    const url = `${window.location.origin}${window.location.pathname}#${hash}`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
    } catch {
      // Clipboard access can be denied or unavailable over plain http; fall
      // back to selecting the URL in a prompt so the link is still gettable.
      window.prompt("Copy this link to share the view:", url);
    }
  }

  return (
    <button
      onClick={copy}
      className={`rounded-lg border px-3 py-1.5 text-xs backdrop-blur-md transition-colors ${
        copied
          ? "border-emerald-400/40 bg-emerald-500/15 text-emerald-300"
          : "border-white/10 bg-black/40 text-neutral-300 hover:bg-black/60"
      }`}
    >
      {copied ? "Link copied" : "Share view"}
    </button>
  );
}
