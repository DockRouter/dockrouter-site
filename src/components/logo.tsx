import { wordmark } from "@/lib/wordmark";
export function RouterMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={`router-mark ${className}`}
      viewBox="0 0 64 64"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 18h16l8 14-8 14H8l8-14z" fill="currentColor" />
      <path d="M56 18H40l-8 14 8 14h16l-8-14z" fill="var(--amber, #f05b35)" />
      <path
        d="M24 8h16M24 56h16"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="square"
      />
      <circle cx="32" cy="32" r="4" fill="var(--paper, #faf9f6)" />
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
        {wordmark.paths.map((p) => (
          <path
            key={p.x}
            d={p.d}
            transform={`translate(${p.x} ${51 - p.y}) scale(${wordmark.scale} ${-wordmark.scale})`}
          />
        ))}
      </svg>
      <span className="sr-only">DockRouter</span>
    </span>
  );
}
