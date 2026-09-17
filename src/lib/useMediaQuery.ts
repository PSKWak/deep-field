import { useCallback, useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query without setting state from an effect.
 *
 * The server snapshot is always `false`, so the markup Next renders matches
 * the desktop case and the client corrects itself on hydration. Because this
 * subscribes to the MediaQueryList, it also responds to a phone rotating or a
 * desktop window being resized across the breakpoint.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query]
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false
  );
}

/** Tailwind's `sm` breakpoint is 640px, so below it is the phone layout. */
export const useIsNarrow = () => useMediaQuery("(max-width: 639px)");
