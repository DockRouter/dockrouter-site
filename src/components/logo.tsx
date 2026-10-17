export function RiftMark({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="40" cy="40" r="30" fill="#F5AD21" />
      <path
        d="M2 25h15c11 0 18 15 25 19l-10-2 5 9C26 46 22 35 14 35H2zM78 55H63c-11 0-18-15-25-19l10 2-5-9c11 5 15 16 23 16h12z"
        fill="currentColor"
      />
      <path
        d="m47 10-8 24 11-3-16 20 9-3-11 24 2-22-10 4 15-22-9 2z"
        fill="var(--logo-cut, #fffdf8)"
      />
      <path
        d="m48 12-9 24 10-3-14 18 8-3-11 22"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <g stroke="var(--logo-cut, #fffdf8)" strokeWidth="1.8">
        <path d="m45 31 17-14M47 35l19-5M43 27l8-15" />
      </g>
      <g fill="var(--logo-cut, #fffdf8)">
        <circle cx="63" cy="16" r="2.8" />
        <circle cx="68" cy="29" r="2.8" />
        <circle cx="52" cy="10" r="2.8" />
      </g>
    </svg>
  );
}
export function Logo() {
  return (
    <span className="logo">
      <RiftMark />
      <span>
        wire<span className="logo-rift">rift</span>
        <span className="logo-period">.</span>
      </span>
    </span>
  );
}
