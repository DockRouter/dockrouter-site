"use client";

import { Mouse, MouseOff } from "lucide-react";
import { setMotionEnabled, useMotionPreference } from "@/lib/motion-preference";

export function MotionToggle() {
  const enabled = useMotionPreference() === "on";
  const label = enabled ? "Animasyonları kapat" : "Animasyonları aç";
  const Icon = enabled ? Mouse : MouseOff;
  return (
    <div className="motion-control" lang="tr">
      <button
        type="button"
        className="motion-toggle"
        aria-label={label}
        aria-pressed={enabled}
        title={label}
        onClick={() => setMotionEnabled(!enabled)}
      >
        <Icon size={18} aria-hidden="true" />
      </button>
      <span className="motion-tooltip" aria-hidden="true">
        {label}
      </span>
    </div>
  );
}
