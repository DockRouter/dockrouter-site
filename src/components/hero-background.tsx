"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createHeroNetwork } from "@/lib/hero-network";

export function HeroBackground() {
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<ReturnType<typeof createHeroNetwork> | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const element = canvas.current;
    const host = element?.closest<HTMLElement>(".hero-scene");
    if (!element || !host) return;
    const scene = createHeroNetwork(element, host, (mode) =>
      setReduced(mode === "reduced"),
    );
    engine.current = scene;
    return () => {
      scene.destroy();
      engine.current = null;
    };
  }, []);

  useEffect(() => {
    engine.current?.setPaused(paused);
  }, [paused]);

  return (
    <>
      <div className="hero-network" aria-hidden="true">
        <canvas ref={canvas} />
      </div>
      <div className="hero-scene-controls container">
        <span className="hero-scene-hint">
          <i /> A network that follows your lead.
          <span> Move around. Tap an open space.</span>
        </span>
        <button
          type="button"
          className="hero-scene-toggle"
          aria-label={
            reduced
              ? "Background motion disabled by your preference"
              : paused
                ? "Play background animation"
                : "Pause background animation"
          }
          aria-pressed={paused || reduced}
          disabled={reduced}
          onClick={() => setPaused((value) => !value)}
        >
          {paused || reduced ? <Play size={12} /> : <Pause size={12} />}
          <span>
            {reduced ? "Still mode" : paused ? "Resume motion" : "Pause motion"}
          </span>
        </button>
      </div>
    </>
  );
}
