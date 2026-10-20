"use client";

import { useSyncExternalStore } from "react";

const query = "(prefers-reduced-motion: reduce)";
function subscribe(notify: () => void) {
  const media = window.matchMedia(query);
  media.addEventListener("change", notify);
  return () => media.removeEventListener("change", notify);
}
function snapshot() {
  return window.matchMedia(query).matches;
}
// Keep the first client tree identical to the static export. The actual
// preference is applied immediately after hydration, then follows OS changes.
export function useReducedMotion() {
  return useSyncExternalStore(subscribe, snapshot, () => false);
}
