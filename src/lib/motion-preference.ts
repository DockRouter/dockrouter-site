"use client";

import { useSyncExternalStore } from "react";

const key = "dockrouter-motion";
const changeEvent = "dockrouter:motion-change";
const query = "(prefers-reduced-motion: reduce)";

function subscribe(callback: () => void) {
  const media = matchMedia(query);
  const storage = (event: StorageEvent) => {
    if (event.key !== key && event.key !== null) return;
    document.documentElement.dataset.backgroundMotion =
      event.newValue === "on" || event.newValue === "off"
        ? event.newValue
        : "system";
    callback();
  };
  window.addEventListener(changeEvent, callback);
  window.addEventListener("storage", storage);
  media.addEventListener("change", callback);
  return () => {
    window.removeEventListener(changeEvent, callback);
    window.removeEventListener("storage", storage);
    media.removeEventListener("change", callback);
  };
}

function snapshot(): "on" | "off" | "reduced" {
  let value = document.documentElement.dataset.backgroundMotion;
  // Read saved state at the preference boundary, independent of head-script
  // execution or hydration. The data attribute holds the current in-memory choice.
  if (value === undefined) {
    try {
      value = localStorage.getItem(key) ?? "system";
    } catch {
      value = "system";
    }
  }
  if (value === "on" || value === "off") return value;
  return matchMedia(query).matches ? "reduced" : "on";
}

export function useMotionPreference() {
  return useSyncExternalStore(subscribe, snapshot, () => "off" as const);
}

export function setMotionEnabled(enabled: boolean) {
  const value = enabled ? "on" : "off";
  document.documentElement.dataset.backgroundMotion = value;
  try {
    localStorage.setItem(key, value);
  } catch {
    // The in-memory choice remains usable when browser storage is unavailable.
  }
  window.dispatchEvent(new Event(changeEvent));
}
