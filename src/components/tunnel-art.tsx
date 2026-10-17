import { RiftMark } from "./logo";

export function TunnelArt() {
  return (
    <div
      className="tunnel-art"
      role="img"
      aria-label="A local application connecting through WireRift to HTTP, TCP and WebSocket services around the world"
    >
      <svg
        className="orbit-svg"
        viewBox="0 0 640 550"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="halo">
            <stop stopColor="#F5AD21" stopOpacity=".16" />
            <stop offset="1" stopColor="#F5AD21" stopOpacity="0" />
          </radialGradient>
          <linearGradient
            id="orbit"
            x1="100"
            y1="100"
            x2="550"
            y2="450"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#F5AD21" stopOpacity=".15" />
            <stop offset=".5" stopColor="#F5AD21" />
            <stop offset="1" stopColor="#F5AD21" stopOpacity=".15" />
          </linearGradient>
        </defs>
        <circle cx="320" cy="270" r="260" fill="url(#halo)" />
        <g className="globe-grid" stroke="currentColor" strokeWidth=".7">
          <circle cx="320" cy="270" r="174" />
          <ellipse cx="320" cy="270" rx="86" ry="174" />
          <ellipse cx="320" cy="270" rx="142" ry="174" />
          <ellipse cx="320" cy="270" rx="174" ry="70" />
          <ellipse cx="320" cy="270" rx="174" ry="133" />
          <path d="M146 270h348M320 96v348" />
        </g>
        <g stroke="url(#orbit)" strokeWidth="1.5">
          <ellipse
            cx="320"
            cy="270"
            rx="275"
            ry="94"
            transform="rotate(-30 320 270)"
          />
          <ellipse
            cx="320"
            cy="270"
            rx="244"
            ry="93"
            transform="rotate(42 320 270)"
          />
        </g>
        <g
          className="orbit-dashed"
          stroke="currentColor"
          strokeDasharray="3 10"
          opacity=".18"
        >
          <circle cx="320" cy="270" r="220" />
          <circle cx="320" cy="270" r="250" />
        </g>
        <g
          className="packet-trail"
          stroke="#e7a11b"
          strokeWidth="3"
          strokeDasharray="22 1340"
          strokeLinecap="round"
        >
          <ellipse
            cx="320"
            cy="270"
            rx="275"
            ry="94"
            transform="rotate(-30 320 270)"
          />
          <ellipse
            cx="320"
            cy="270"
            rx="244"
            ry="93"
            transform="rotate(42 320 270)"
          />
        </g>
        <g fill="#F5AD21" stroke="var(--paper)" strokeWidth="5">
          <circle cx="129" cy="164" r="8" />
          <circle cx="493" cy="340" r="8" />
          <circle cx="397" cy="125" r="8" />
          <circle cx="206" cy="401" r="8" />
        </g>
        <g stroke="currentColor" opacity=".3">
          <path d="M40 56h13m-6.5-6.5v13M580 460h13m-6.5-6.5v13M590 85h13m-6.5-6.5v13M47 453h13m-6.5-6.5v13" />
        </g>
        <path
          d="M76 270h100m288 0h100"
          stroke="currentColor"
          strokeDasharray="2 5"
          opacity=".3"
        />
      </svg>
      <div className="rift-core">
        <RiftMark />
        <span>THE RIFT</span>
      </div>
      <div className="art-label art-local">
        <span className="art-icon">⌘</span>
        <span>
          <small>YOUR MACHINE</small>
          <strong>localhost:3000</strong>
        </span>
        <i />
      </div>
      <div className="art-label art-world">
        <span className="status-light" />
        <span>
          <small>HELLO, WORLD</small>
          <strong>myapp.example.com</strong>
        </span>
      </div>
      <span className="protocol-chip chip-http">
        HTTP <span>200 OK</span>
      </span>
      <span className="protocol-chip chip-tcp">
        TCP <i />
      </span>
      <span className="protocol-chip chip-ws">
        <i /> WebSocket
      </span>
      <div className="art-caption">
        <span>FIG. 01</span> ONE CONNECTION. EVERY POSSIBILITY.<span>↗</span>
      </div>
    </div>
  );
}

export function FlowArt() {
  return (
    <div className="flow-diagram">
      <div className="flow-node">
        <div className="flow-node-icon">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="10" y="10" width="44" height="33" rx="3" />
            <path d="M5 50h54M25 22l-7 5 7 5m14-10 7 5-7 5m-10 3 5-16" />
          </svg>
        </div>
        <span className="mono">01 / LOCAL</span>
        <h3>Your app</h3>
        <p>Right where you build it.</p>
        <code>localhost:3000</code>
      </div>
      <div className="flow-line">
        <span>outbound</span>
        <i />
        <b>→</b>
      </div>
      <div className="flow-node">
        <div className="flow-node-icon rift">
          <RiftMark />
        </div>
        <span className="mono">02 / CONNECT</span>
        <h3>WireRift client</h3>
        <p>One lightweight binary.</p>
        <code>multiplexed streams</code>
      </div>
      <div className="flow-line amber">
        <span>one connection</span>
        <i />
        <b>→</b>
      </div>
      <div className="flow-node">
        <div className="flow-node-icon">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <rect x="10" y="8" width="44" height="13" rx="3" />
            <rect x="10" y="26" width="44" height="13" rx="3" />
            <rect x="10" y="44" width="44" height="13" rx="3" />
            <path d="M18 14h1m-1 18h1m-1 18h1m20-36h7M39 32h7m-7 18h7" />
          </svg>
        </div>
        <span className="mono">03 / ROUTE</span>
        <h3>Your server</h3>
        <p>Your infrastructure. Your rules.</p>
        <code>HTTP · TCP · WebSocket</code>
      </div>
      <div className="flow-line">
        <span>public edge</span>
        <i />
        <b>→</b>
      </div>
      <div className="flow-node">
        <div className="flow-node-icon">
          <svg
            viewBox="0 0 64 64"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <circle cx="32" cy="32" r="23" />
            <ellipse cx="32" cy="32" rx="11" ry="23" />
            <path d="M9 32h46M14 19h36M14 45h36" />
          </svg>
        </div>
        <span className="mono">04 / SHARE</span>
        <h3>The world</h3>
        <p>One URL. Open possibilities.</p>
        <code>your domain, connected</code>
      </div>
    </div>
  );
}
