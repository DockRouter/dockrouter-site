"use client";
import { useId } from "react";
import { anchorGeometry as shape } from "@/lib/brand-geometry";
import { wordmark } from "@/lib/wordmark";
export function RouterGlyph() {
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  return (
    <g fill="none" data-brand="dockrouter-anchor">
      <defs>
        <linearGradient
          id={`${id}-blue`}
          x1="160"
          y1="0"
          x2="256"
          y2="512"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#0879f5" />
          <stop offset=".55" stopColor="#0870ed" />
          <stop offset="1" stopColor="#2b43bd" />
        </linearGradient>
        <clipPath id={`${id}-left`}>
          <path d="M0 0h256v512H0z" />
        </clipPath>
      </defs>
      <g fill="var(--brand-navy)" fillRule="evenodd">
        {[shape.ring, shape.cross, shape.anchor].map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <g
        fill={`url(#${id}-blue)`}
        fillRule="evenodd"
        clipPath={`url(#${id}-left)`}
      >
        {[shape.ring, shape.cross, shape.anchor].map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
      <path
        d={shape.routes}
        stroke="var(--brand-navy)"
        strokeWidth="32"
        strokeLinejoin="round"
      />
      {shape.nodes.map((p) => (
        <path
          key={p.y + p.x}
          fill="var(--brand-orange)"
          fillRule="evenodd"
          d={`M${p.x + 35} ${p.y}a35 35 0 1 1-70 0 35 35 0 0 1 70 0ZM${p.x + 16} ${p.y}a16 16 0 1 0-32 0 16 16 0 0 0 32 0Z`}
        />
      ))}
    </g>
  );
}
export function RouterMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`router-mark ${className}`}
      viewBox="0 0 512 512"
      width="512"
      height="512"
      fill="none"
      aria-hidden="true"
    >
      <RouterGlyph />
    </svg>
  );
}
export function Logo() {
  return (
    <span className="logo">
      <RouterMark />
      <svg
        className="logo-type"
        viewBox={`0 0 ${wordmark.width} 64`}
        fill="currentColor"
        aria-hidden="true"
      >
        {wordmark.paths.map((p, i) => (
          <path
            key={p.x}
            d={p.d}
            fill={i < 4 ? "var(--brand-navy)" : "var(--brand-orange)"}
            transform={`translate(${p.x} ${51 - p.y}) scale(${wordmark.scale} ${-wordmark.scale})`}
          />
        ))}
      </svg>
      <span className="sr-only">DockRouter</span>
    </span>
  );
}
