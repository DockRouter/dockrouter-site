import { rayEnd, riftGeometry as shape } from "@/lib/brand-geometry";
import { wordmark } from "@/lib/wordmark";

export function RiftMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`rift-mark ${className}`}
      viewBox="0 0 128 128"
      fill="none"
      aria-hidden="true"
    >
      <circle {...shape.disc} fill="#F5AD21" />
      {shape.wires.map((d) => (
        <path
          key={d}
          d={d}
          fill="currentColor"
          stroke="var(--logo-cut, #fffdf8)"
          strokeWidth="3.2"
          strokeLinejoin="round"
          paintOrder="stroke"
        />
      ))}
      <g
        fill="var(--logo-cut, #fffdf8)"
        stroke="var(--logo-cut, #fffdf8)"
        strokeWidth="2.2"
        strokeLinecap="round"
      >
        {shape.rays.map((p) => (
          <g key={`${p.ex}:${p.ey}`}>
            <path d={`M${p.x} ${p.y} ${p.ex} ${p.ey}`} stroke="#F5AD21" />
            <path d={`M${p.x} ${p.y} ${rayEnd(p).x} ${rayEnd(p).y}`} />
            <circle
              cx={p.ex}
              cy={p.ey}
              r={p.r}
              stroke="none"
              fill={rayEnd(p).outer ? "#F5AD21" : "var(--logo-cut, #fffdf8)"}
            />
          </g>
        ))}
        <path
          d={shape.arrow}
          strokeLinecap="butt"
          stroke="#F5AD21"
          fill="#F5AD21"
        />
        {shape.sparks.map((p) => (
          <circle key={p.cx} {...p} stroke="none" />
        ))}
      </g>
      <path
        d={shape.bolt}
        fill="currentColor"
        stroke="var(--logo-cut, #fffdf8)"
        strokeWidth="3.8"
        strokeLinejoin="miter"
        paintOrder="stroke"
      />
    </svg>
  );
}
export function Logo() {
  return (
    <span className="logo">
      <RiftMark />
      <svg
        className="logo-type"
        viewBox={`0 0 ${wordmark.width} 64`}
        fill="currentColor"
        aria-hidden="true"
      >
        {wordmark.paths.map((p) => (
          <path
            key={p.x}
            d={p.d}
            transform={`translate(${p.x} ${51 - p.y}) scale(${wordmark.scale} ${-wordmark.scale})`}
          />
        ))}
      </svg>
      <span className="sr-only">WireRift</span>
    </span>
  );
}
