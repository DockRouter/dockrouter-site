import { RouterGlyph, RouterMark } from "./logo";
export function RouterArt() {
  return (
    <figure
      className="router-art"
      aria-label="Illustration: incoming HTTPS traffic passes through DockRouter to three Docker services"
    >
      <div className="art-top">
        <span>
          <i /> DOCKER ENGINE CONNECTED
        </span>
        <span>INGRESS / 001</span>
      </div>
      <svg
        className="routing-drawing"
        viewBox="0 0 680 575"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <pattern
            id="route-grid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path d="M32 0H0V32" stroke="var(--line)" strokeWidth=".7" />
          </pattern>
          <linearGradient
            id="edge-surface"
            x1="130"
            y1="100"
            x2="560"
            y2="490"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="var(--surface)" />
            <stop offset="1" stopColor="var(--surface-soft)" />
          </linearGradient>
        </defs>
        <rect
          y="10"
          width="680"
          height="530"
          fill="url(#route-grid)"
          opacity=".7"
        />
        <g stroke="var(--diagram-line)" strokeWidth="1.5">
          <path d="M340 64v100M340 320v46q0 22-22 22H152v50M340 320v118M340 320v46q0 22 22 22h166v50" />
          <path d="M46 251h160M474 251h160" strokeDasharray="4 7" />
        </g>
        <g
          className="packet-trail"
          stroke="var(--amber)"
          strokeWidth="3"
          strokeDasharray="8 360"
        >
          <path d="M340 64v100" />
          <path d="M340 320v46q0 22-22 22H152v50" />
          <path d="M340 320v118" />
          <path d="M340 320v46q0 22 22 22h166v50" />
        </g>
        <g>
          <rect
            x="263"
            y="30"
            width="154"
            height="42"
            rx="21"
            fill="var(--surface)"
            stroke="var(--line)"
          />
          <circle cx="286" cy="51" r="4" fill="var(--green)" />
          <text
            x="302"
            y="55"
            fill="var(--muted)"
            fontFamily="monospace"
            fontSize="11"
          >
            HTTPS :443
          </text>
        </g>
        <g className="router-float">
          <path
            d="m210 237 130-75 130 75v75l-130 75-130-75z"
            fill="var(--diagram-side)"
            stroke="var(--diagram-line)"
          />
          <path
            d="m210 237 130 75 130-75-130-75z"
            fill="url(#edge-surface)"
            stroke="var(--diagram-line)"
          />
          <path d="M340 312v75" stroke="var(--diagram-line)" />
          <path d="m232 277 85 49M232 291l85 49" stroke="var(--diagram-line)" />
          <path d="m366 326 76-44" stroke="var(--amber)" strokeWidth="3" />
          <circle cx="447" cy="309" r="3" fill="var(--green)" />
          <g transform="translate(297 187) scale(.16875 .0975)">
            <RouterGlyph />
          </g>
        </g>
        <g fontFamily="monospace" fontSize="10" fill="var(--muted)">
          <text x="43" y="230">
            TLS TERMINATION
          </text>
          <text x="498" y="230">
            AUTO DISCOVERY
          </text>
          <text x="291" y="283" letterSpacing="3">
            DOCKROUTER
          </text>
        </g>
        {[
          { x: 84, name: "web", host: "app.example.com" },
          { x: 272, name: "api", host: "api.example.com" },
          { x: 460, name: "worker", host: "jobs.example.com" },
        ].map(({ x, name, host }) => (
          <g key={name} className={`service-cube cube-${name}`}>
            <path
              d={`m${x} 439 68-39 68 39v49l-68 39-68-39z`}
              fill="var(--diagram-side)"
              stroke="var(--diagram-line)"
            />
            <path
              d={`m${x} 439 68 39 68-39-68-39z`}
              fill="var(--surface)"
              stroke="var(--diagram-line)"
            />
            <path d={`M${x + 68} 478v49`} stroke="var(--diagram-line)" />
            <text
              x={x + 68}
              y="444"
              textAnchor="middle"
              fill="var(--ink)"
              fontSize="13"
              fontFamily="monospace"
            >
              {name}
            </text>
            <circle cx={x + 111} cy="480" r="3" fill="var(--green)" />
            <text
              x={x + 68}
              y="553"
              textAnchor="middle"
              fill="var(--muted)"
              fontSize="10"
              fontFamily="monospace"
            >
              {host}
            </text>
          </g>
        ))}
      </svg>
      <div className="art-float-label">
        <span className="tiny-router">
          <RouterMark />
        </span>
        <span>
          One binary.<strong>Every container.</strong>
        </span>
        <span className="art-check">✓</span>
      </div>
      <figcaption>
        <span>FIG. 01 — THE SHORTEST PATH TO YOUR CONTAINERS</span>
        <span>100% GO ↗</span>
      </figcaption>
    </figure>
  );
}
