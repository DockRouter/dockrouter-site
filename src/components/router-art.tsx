"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Box,
  Check,
  Globe2,
  LockKeyhole,
  Pause,
  Play,
  Radio,
  RotateCcw,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "@/lib/use-reduced-motion";
import { RouterGlyph } from "./logo";

const destinations = [
  {
    name: "Web app",
    host: "app.example.com",
    path: "/",
    port: "80",
    icon: Globe2,
    y: 116,
    line: "M464 270h36q28 0 28-28v-98q0-28 28-28h20",
  },
  {
    name: "API service",
    host: "api.example.com",
    path: "/v1",
    port: "8080",
    icon: Box,
    y: 270,
    line: "M464 270h112",
  },
  {
    name: "Realtime",
    host: "live.example.com",
    path: "/socket",
    port: "3000",
    icon: Radio,
    y: 424,
    line: "M464 270h36q28 0 28 28v98q0 28 28 28h20",
  },
];
const phases = ["Receive", "Secure", "Match", "Route"];
const durations = [1200, 1300, 1400, 2300];

export function RouterArt() {
  const reduce = useReducedMotion();
  const [route, setRoute] = useState(1);
  const [phase, setPhase] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [inView, setInView] = useState(false);
  const [pageVisible, setPageVisible] = useState(true);
  const [replay, setReplay] = useState(0);
  const figure = useRef<HTMLElement>(null);
  const manualRoute = useRef(false);
  const current = destinations[route];
  const step = reduce ? 3 : phase;
  const running = playing && inView && pageVisible && !reduce;

  useEffect(() => {
    const element = figure.current;
    if (!element) return;
    if (!("IntersectionObserver" in window)) setInView(true);
    const observer =
      "IntersectionObserver" in window
        ? new IntersectionObserver(
            (entries) =>
              setInView(entries.some((entry) => entry.isIntersecting)),
            { threshold: 0.15 },
          )
        : null;
    observer?.observe(element);
    const visibility = () => setPageVisible(!document.hidden);
    visibility();
    document.addEventListener("visibilitychange", visibility);
    return () => {
      observer?.disconnect();
      document.removeEventListener("visibilitychange", visibility);
    };
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: Selecting or replaying the same phase must restart its timer.
  useEffect(() => {
    if (!running) return;
    const timer = window.setTimeout(() => {
      setPhase((phase + 1) % phases.length);
      if (phase === 3 && !manualRoute.current)
        setRoute((value) => (value + 1) % destinations.length);
    }, durations[phase]);
    return () => window.clearTimeout(timer);
  }, [running, phase, replay, route]);

  function selectRoute(index: number) {
    manualRoute.current = true;
    setRoute(index);
    setPhase(0);
    setReplay((value) => value + 1);
  }
  function restart() {
    setPhase(0);
    setReplay((value) => value + 1);
    setPlaying(true);
  }

  return (
    <figure
      ref={figure}
      className="router-art hero-routing"
      aria-label="Interactive illustration of HTTPS traffic routing through DockRouter"
      data-phase={step}
      data-playing={running ? "true" : "false"}
      data-reduced={reduce ? "true" : "false"}
    >
      <div className="routing-heading">
        <span className="routing-heading-mark" />
        <span>
          One small router.<strong>A clear way in.</strong>
        </span>
        <button
          type="button"
          className="routing-play"
          disabled={Boolean(reduce)}
          aria-label={
            reduce
              ? "Animation disabled by reduced motion preference"
              : playing
                ? "Pause routing animation"
                : "Play routing animation"
          }
          onClick={() => setPlaying((value) => !value)}
        >
          {playing && !reduce ? <Pause size={14} /> : <Play size={14} />}
        </button>
      </div>
      <div className="routing-stage">
        <div className="routing-stage-grid" aria-hidden="true" />
        <svg
          className="routing-drawing"
          viewBox="0 0 760 590"
          fill="none"
          aria-hidden="true"
        >
          <defs>
            <radialGradient id="routing-aura">
              <stop stopColor="var(--accent-ink)" stopOpacity=".12" />
              <stop offset="1" stopColor="var(--accent-ink)" stopOpacity="0" />
            </radialGradient>
            <linearGradient
              id="routing-engine-face"
              x1="260"
              y1="170"
              x2="445"
              y2="385"
              gradientUnits="userSpaceOnUse"
            >
              <stop stopColor="var(--surface)" />
              <stop offset="1" stopColor="var(--surface-soft)" />
            </linearGradient>
          </defs>
          <circle cx="354" cy="270" r="216" fill="url(#routing-aura)" />
          <g stroke="var(--diagram-line)" strokeWidth="1">
            <path d="M230 83h-20v20M478 83h20v20M230 457h-20v-20M478 457h20v-20" />
            <path d="M354 74v20M354 446v20M158 270h20M530 270h20" />
            <circle cx="354" cy="270" r="148" strokeDasharray="1 10" />
            <circle cx="354" cy="270" r="130" strokeOpacity=".4" />
          </g>
          <path
            d="M178 270h64"
            stroke="var(--diagram-line)"
            strokeWidth="1.5"
          />
          <path
            className="ingress-packet packet-trail"
            key={`in-${replay}-${route}-${step}`}
            d="M178 270h64"
            pathLength="1"
            stroke="var(--amber)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray=".12 .88"
          />
          {destinations.map((destination, index) => (
            <g
              key={destination.name}
              className={`hero-route-line ${route === index ? "is-selected" : ""}`}
            >
              <path
                d={destination.line}
                stroke="var(--diagram-line)"
                strokeWidth="1.5"
              />
              <path
                className="hero-route-highlight"
                d={destination.line}
                stroke="var(--accent-ink)"
                strokeWidth="2"
              />
              <path
                key={`${replay}-${step}`}
                className="outgoing-packet packet-trail"
                d={destination.line}
                pathLength="1"
                stroke="var(--amber)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray=".08 .92"
              />
              <circle
                className="route-endpoint"
                cx="576"
                cy={destination.y}
                r="4"
                fill="var(--surface)"
                stroke="var(--diagram-line)"
                strokeWidth="1.5"
              />
            </g>
          ))}
          <g className="router-float">
            <circle
              cx="354"
              cy="277"
              r="111"
              fill="var(--diagram-side)"
              stroke="var(--diagram-line)"
            />
            <circle
              cx="354"
              cy="270"
              r="111"
              fill="url(#routing-engine-face)"
              stroke="var(--diagram-line)"
            />
            <circle
              cx="354"
              cy="270"
              r="99"
              stroke="var(--diagram-line)"
              strokeOpacity=".6"
            />
            <path
              className="engine-secure-ring"
              d="M243 270a111 111 0 1 1 222 0"
              pathLength="1"
              stroke="var(--accent-ink)"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <g
              className="hero-emblem"
              transform="translate(288 204) scale(.2578125)"
            >
              <RouterGlyph />
            </g>
          </g>
          <g stroke="var(--diagram-line)" strokeWidth="1">
            <path d="M354 382v65M225 511h258" />
            <circle cx="354" cy="450" r="3" fill="var(--surface)" />
          </g>
        </svg>
        <div className="hero-incoming">
          <span className="hero-request-icon">
            <Globe2 size={19} />
            <ArrowDownLeft size={12} />
          </span>
          <strong>HTTPS request</strong>
          <code>GET {current.path}</code>
          <span className="hero-ingress-port">
            <LockKeyhole size={10} />
            :443
          </span>
        </div>
        <div className="hero-engine-name">
          <strong>
            Dock<span>Router</span>
          </strong>
          <span>THE DOCKER-NATIVE EDGE</span>
        </div>
        <div className="hero-tls-chip">
          <LockKeyhole size={12} />
          <span>TLS, handled.</span>
          <Check size={11} />
        </div>
        <div className="hero-label-chip">
          <span className="hero-label-dot" />
          <code>dr.host</code>
          <span>→</span>
          <code>{current.host}</code>
        </div>
        <fieldset
          className="hero-destinations"
          aria-label="Choose a routing destination"
        >
          {destinations.map((destination, index) => (
            <button
              type="button"
              className={`hero-destination ${route === index ? "is-selected" : ""}`}
              key={destination.name}
              style={{ top: `${(destination.y / 590) * 100}%` }}
              aria-pressed={route === index}
              aria-label={`Route to ${destination.name}`}
              onClick={() => selectRoute(index)}
            >
              <span className="destination-icon">
                <destination.icon size={17} />
              </span>
              <span>
                <strong>{destination.name}</strong>
                <small>:{destination.port}</small>
              </span>
              <span className="destination-status">
                {route === index && step === 3 ? (
                  <Check size={12} />
                ) : (
                  <ArrowUpRight size={12} />
                )}
              </span>
            </button>
          ))}
        </fieldset>
        <div
          className="hero-route-result"
          data-complete={step === 3 ? "true" : "false"}
        >
          <span className="result-light" />
          <strong>
            {step === 3
              ? "200 OK"
              : [
                  "Incoming request",
                  "Securing connection",
                  "Matching Docker labels",
                ][step]}
          </strong>
          <span>
            {step === 3 ? current.host : "A little less to configure."}
          </span>
        </div>
      </div>
      <ol className="routing-sequence" aria-label="Routing steps">
        {phases.map((label, index) => (
          <li
            key={label}
            aria-current={step === index ? "step" : undefined}
            data-active={step === index ? "true" : "false"}
            data-complete={step > index ? "true" : "false"}
          >
            <i>{step > index ? <Check size={10} /> : `0${index + 1}`}</i>
            <span>{label}</span>
            <b />
          </li>
        ))}
      </ol>
      <figcaption>
        <span>Interactive example · choose a service to follow its route.</span>
        <button
          type="button"
          onClick={restart}
          aria-label="Replay hero request"
        >
          <RotateCcw size={11} />
          Replay
        </button>
      </figcaption>
    </figure>
  );
}
