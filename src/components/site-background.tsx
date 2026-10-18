"use client";

import { Pause, Play } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";
import { createSiteBackground } from "@/lib/site-background";

export function SiteBackground() {
  const id = useId().replaceAll(":", "");
  const svg = useRef<SVGSVGElement>(null);
  const scene = useRef<SVGGElement>(null);
  const engine = useRef<ReturnType<typeof createSiteBackground> | null>(null);
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (!svg.current || !scene.current) return;
    const field = createSiteBackground(svg.current, scene.current, (mode) =>
      setReduced(mode === "reduced"),
    );
    engine.current = field;
    return () => {
      field.destroy();
      engine.current = null;
    };
  }, []);
  useEffect(() => {
    engine.current?.setPaused(paused);
  }, [paused]);

  return (
    <>
      <div className="site-background" aria-hidden="true">
        <svg
          ref={svg}
          xmlns="http://www.w3.org/2000/svg"
          width="100%"
          height="100%"
          focusable="false"
        >
          <defs>
            <linearGradient id={`${id}-quiet`}>
              <stop offset="0" stopColor="white" stopOpacity="0" />
              <stop offset=".08" stopColor="white" stopOpacity=".8" />
              <stop offset=".24" stopColor="white" stopOpacity=".2" />
              <stop offset=".5" stopColor="white" stopOpacity=".15" />
              <stop offset=".76" stopColor="white" stopOpacity=".2" />
              <stop offset=".92" stopColor="white" stopOpacity=".8" />
              <stop offset="1" stopColor="white" stopOpacity="0" />
            </linearGradient>
            <mask id={`${id}-mask`}>
              <rect width="100%" height="100%" fill={`url(#${id}-quiet)`} />
            </mask>
          </defs>
          <g ref={scene} />
        </svg>
      </div>
      <button
        type="button"
        className="site-motion-toggle"
        aria-label={
          reduced
            ? "Background motion disabled by your preference"
            : paused
              ? "Play background animation"
              : "Pause background animation"
        }
        aria-pressed={paused || reduced}
        title={
          reduced
            ? "Background motion disabled by your preference"
            : paused
              ? "Play background animation"
              : "Pause background animation"
        }
        disabled={reduced}
        onClick={() => setPaused((value) => !value)}
      >
        {paused || reduced ? <Play size={14} /> : <Pause size={14} />}
        <span className="sr-only">
          {reduced ? "Still mode" : paused ? "Resume motion" : "Pause motion"}
        </span>
      </button>
    </>
  );
}
