"use client";
import {
  ArrowRight,
  Box,
  Check,
  ChevronRight,
  Globe,
  LockKeyhole,
  Play,
  RotateCcw,
} from "lucide-react";
import { useId, useState } from "react";
import { binary, compose, dockerRun } from "@/lib/examples";
import { Code } from "./code";

const methods = [
  { name: "Docker Compose", file: "compose.yml", code: compose },
  { name: "Docker Run", file: "terminal", code: dockerRun },
  { name: "Build from source", file: "terminal · Go 1.22+", code: binary },
];
export function Quickstart() {
  const [active, setActive] = useState(0);
  const id = useId();
  return (
    <div className="setup-layout">
      <div className="setup-steps">
        {[
          "Point your domain at your server.",
          "Start DockRouter with your ACME email.",
          "Label your app. Let the router handle it.",
        ].map((title, i) => (
          <div key={title}>
            <span>0{i + 1}</span>
            <p>{title}</p>
            {i === 2 && <Check size={17} />}
          </div>
        ))}
        <p className="setup-note">
          Use a Linux Docker host with ports 80 and 443 reachable. Replace the
          example domain and email with yours. Keep DockRouter and your services
          on a shared Docker network.
        </p>
        <a href="/docs/getting-started/" className="text-link">
          Read the deployment guide <ArrowRight size={15} />
        </a>
      </div>
      <div className="setup-code">
        <div role="tablist" aria-label="Installation method">
          {methods.map((m, i) => (
            <button
              type="button"
              key={m.name}
              role="tab"
              id={`${id}-tab-${i}`}
              aria-selected={i === active}
              aria-controls={`${id}-panel`}
              tabIndex={i === active ? 0 : -1}
              onClick={() => setActive(i)}
              onKeyDown={(e) => {
                let next = i;
                if (e.key === "ArrowRight") next = (i + 1) % methods.length;
                else if (e.key === "ArrowLeft")
                  next = (i + methods.length - 1) % methods.length;
                else if (e.key === "Home") next = 0;
                else if (e.key === "End") next = methods.length - 1;
                else return;
                e.preventDefault();
                setActive(next);
                document.getElementById(`${id}-tab-${next}`)?.focus();
              }}
            >
              {m.name}
            </button>
          ))}
        </div>
        <div
          role="tabpanel"
          id={`${id}-panel`}
          aria-labelledby={`${id}-tab-${active}`}
        >
          <Code title={methods[active].file}>{methods[active].code}</Code>
        </div>
      </div>
    </div>
  );
}
const services = [
  {
    name: "web",
    host: "app.example.com",
    port: "80",
    path: "/",
    policy: "roundrobin",
  },
  {
    name: "api",
    host: "api.example.com",
    port: "8080",
    path: "/v1",
    policy: "leastconn",
  },
  {
    name: "realtime",
    host: "live.example.com",
    port: "3000",
    path: "/",
    policy: "iphash",
  },
];
export function RouteDemo() {
  const [active, setActive] = useState(0);
  const [sent, setSent] = useState(0);
  const route = services[active];
  return (
    <div className="route-demo">
      <div className="demo-toolbar">
        <span>
          <i /> ROUTE EXPLORER
        </span>
        <span>INTERACTIVE EXAMPLE</span>
        <span>
          <span className="status-light" /> 3 routes discovered
        </span>
      </div>
      <div className="demo-body">
        <div className="demo-routes">
          <span className="demo-caption">DOCKER SERVICES</span>
          {services.map((service, i) => (
            <button
              type="button"
              key={service.name}
              aria-pressed={active === i}
              onClick={() => {
                setActive(i);
                setSent(0);
              }}
            >
              <Box size={20} />
              <span>
                <strong>{service.name}</strong>
                <small>{service.host}</small>
              </span>
              <ChevronRight size={16} />
            </button>
          ))}
          <p>
            <span className="status-light" /> Watching Docker events
          </p>
        </div>
        <div className="demo-detail">
          <div className="demo-request">
            <Globe size={16} />
            <span>
              https://{route.host}
              {route.path}
            </span>
            <span className="secure-pill">
              <LockKeyhole size={12} />
              TLS
            </span>
          </div>
          <div className="request-journey" key={`${active}-${sent}`}>
            <span>
              <Globe />
              Request
            </span>
            <i />
            <span>
              <LockKeyhole />
              DockRouter
            </span>
            <i />
            <span>
              <Box />
              {route.name}:{route.port}
            </span>
          </div>
          <div className="demo-labels">
            <span>CONTAINER LABELS</span>
            <pre>
              <code>{`dr.enable: "true"\ndr.host: "${route.host}"\ndr.port: "${route.port}"\ndr.tls: "auto"\ndr.loadbalancer: "${route.policy}"`}</code>
            </pre>
          </div>
          <div className="demo-test">
            <button
              type="button"
              className="button secondary"
              onClick={() => setSent(sent + 1)}
            >
              {sent ? <RotateCcw size={14} /> : <Play size={14} />}Send example
              request
            </button>
            <span role="status">
              {sent
                ? `200 OK · example request ${sent} routed to ${route.name}`
                : "Choose a route. Follow a request."}
            </span>
          </div>
        </div>
      </div>
      <div className="demo-bottom">
        <span>
          Illustrative data. Requests run locally as a visual simulation.
        </span>
        <span>NO BACKEND CONNECTION</span>
      </div>
    </div>
  );
}
