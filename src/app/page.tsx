import {
  ArrowRight,
  ArrowUpRight,
  Box,
  ChevronDown,
  Code2,
  Github,
  HeartPulse,
  Layers3,
  LockKeyhole,
  Network,
  Radio,
  RefreshCw,
  ShieldCheck,
  Waypoints,
  Zap,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Reveal } from "@/components/motion";
import { RouterArt } from "@/components/router-art";
import { Quickstart, RouteDemo } from "@/components/router-interactions";
import { REPO, VERSION } from "@/lib/site";
export const metadata: Metadata = { alternates: { canonical: "/" } };
const faqs = [
  [
    "What is DockRouter?",
    "A Docker-native ingress router written in Go. It discovers labeled containers, terminates TLS and forwards HTTP and WebSocket traffic to your services. Run it on your own infrastructure as a Docker container or a single binary.",
  ],
  [
    "Do I need a separate configuration file?",
    "Routing lives in your Docker labels. Set dr.enable and dr.host on your services; add labels for TLS, middleware and load balancing when needed. Global settings such as your ACME email use environment variables or CLI flags.",
  ],
  [
    "What do I need for automatic HTTPS?",
    "A domain that resolves to your Docker host, publicly reachable ports 80 and 443, an ACME email and persistent storage for certificates. DockRouter uses the Let's Encrypt HTTP-01 challenge. It also supports manually supplied certificates.",
  ],
  [
    "Can I use it with Docker Compose?",
    "Yes. Run DockRouter and your application services on a shared network, mount the Docker socket and add routing labels to your services. The quick start below provides a complete Compose example.",
  ],
  [
    "Is the dashboard public?",
    "The admin listener binds to 127.0.0.1 by default. If you expose it, configure DR_ADMIN_BIND deliberately and set DR_ADMIN_USER and DR_ADMIN_PASS. Keep the admin port behind a private network or authenticated access.",
  ],
  [
    "Can I use DockRouter commercially?",
    "Yes. DockRouter is open source under the MIT license. You can use, modify and distribute it commercially subject to the license terms. The source, issues and releases are available on GitHub.",
  ],
];
const features = [
  {
    icon: ShieldCheck,
    title: "Your edge. Your rules.",
    text: "Rate limits, CORS and IP filtering.",
  },
  {
    icon: HeartPulse,
    title: "Room to recover.",
    text: "Health checks, retries and circuit breakers.",
  },
  {
    icon: Zap,
    title: "Keep the conversation going.",
    text: "Streaming responses and WebSockets.",
  },
  {
    icon: Layers3,
    title: "One cohesive runtime.",
    text: "Pure Go. No external Go packages.",
  },
];
export default function Home() {
  return (
    <main id="main">
      <section className="hero-scene" aria-label="DockRouter introduction">
        <div className="dock-hero container">
          <div className="dock-hero-copy">
            <a
              className="release-badge"
              href={`${REPO}/releases/tag/v${VERSION}`}
            >
              <span className="status-light" />
              <strong>v{VERSION}</strong>
              <span>Small binary. Clear direction.</span>
              <ArrowRight size={13} />
            </a>
            <div className="hero-kicker">THE DOCKER-NATIVE INGRESS ROUTER</div>
            <h1>
              Stop configuring.
              <br />
              <span>Start shipping.</span>
            </h1>
            <p className="dock-lead">
              You build the application.
              <br />
              We’ll find the way in.
            </p>
            <p className="dock-description">
              Automatic discovery. Effortless HTTPS. One Go binary that turns
              your Docker labels into live routes.
            </p>
            <div className="hero-buttons">
              <Link className="button primary" href="#quickstart">
                Start routing <ArrowRight size={17} />
              </Link>
              <a className="button secondary" href={REPO}>
                <Github size={17} />
                Explore the source
                <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="hero-proof">
              <span>
                <i />
                Pure Go
              </span>
              <span>Zero dependencies</span>
              <span>MIT licensed</span>
            </div>
          </div>
          <RouterArt />
        </div>
      </section>
      <div className="dock-principles container">
        <span>
          LESS TO CONFIGURE.
          <br />
          <strong>MORE TO SHIP.</strong>
        </span>
        <span>
          <Box />
          Docker-native
        </span>
        <span>
          <LockKeyhole />
          Automatic TLS
        </span>
        <span>
          <Waypoints />
          Label-based routes
        </span>
        <span>
          <Radio />
          Live discovery
        </span>
      </div>
      <section className="section container" id="how-it-works">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <i />A LITTLE LESS BETWEEN YOU AND LIVE
              </span>
              <h2>
                Three labels.
                <br />
                <span>A clear path forward.</span>
              </h2>
            </div>
            <div className="section-intro">
              <p>
                Your containers already know what they are.
                <br />
                Give them a hostname. Let discovery do the rest.
              </p>
              <Link className="text-link" href="/docs/routing/">
                Understand the routing <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <div className="how-layout">
            <div className="label-note">
              <div className="file-heading">
                <Code2 size={16} />
                <span>compose.yml</span>
                <span>YOUR APPLICATION</span>
              </div>
              <pre>
                <code>
                  <span className="code-comment">
                    # A few labels. That’s your route.
                  </span>
                  {`\nservices:\n  web:\n    image: my-app:latest\n    labels:\n`}
                  <span className="code-accent">{`      dr.enable: "true"\n      dr.host: "app.example.com"\n      dr.tls: "auto"`}</span>
                </code>
              </pre>
              <div className="label-foot">
                <span className="status-light" /> Less ceremony. More
                application.
              </div>
            </div>
            <div className="how-steps">
              {[
                [
                  "01",
                  "Label it.",
                  "Declare your hostname and TLS preference alongside your app. Routing belongs with the service.",
                ],
                [
                  "02",
                  "Discover it.",
                  "DockRouter watches Docker and updates the route table as containers start and stop.",
                ],
                [
                  "03",
                  "Ship it.",
                  "Requests pass through TLS and middleware to the right container. Your next deploy is already connected.",
                ],
              ].map(([n, title, text]) => (
                <div key={n}>
                  <span>{n}</span>
                  <div>
                    <h3>{title}</h3>
                    <p>{text}</p>
                  </div>
                  <ArrowUpRight size={19} />
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      </section>
      <section className="capabilities" id="features">
        <div className="section container">
          <Reveal>
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  <i />
                  SMALL FOOTPRINT. FULL TOOLKIT.
                </span>
                <h2>
                  Good infrastructure
                  <br />
                  <span>gets out of your way.</span>
                </h2>
              </div>
              <p className="section-intro">
                The essentials of an ingress stack.
                <br />
                Already speaking Docker.
              </p>
            </div>
          </Reveal>
          <div className="cap-grid">
            <Reveal className="cap-card cap-tls">
              <div className="cap-top">
                <LockKeyhole size={21} />
                <span>01 / HTTPS, HANDLED</span>
              </div>
              <div className="tls-visual" aria-hidden="true">
                <div className="tls-ring" />
                <div className="tls-ring second" />
                <ShieldCheck size={64} strokeWidth={1} />
                <span>
                  <i />
                  CERTIFICATE ACTIVE
                </span>
              </div>
              <h3>A secure welcome.</h3>
              <p>
                Built-in Let’s Encrypt support provisions and renews
                certificates. Bring your own certificates when you need to.
              </p>
              <Link className="text-link" href="/docs/tls/">
                Explore automatic TLS <ArrowRight size={14} />
              </Link>
            </Reveal>
            <Reveal className="cap-card cap-discover" delay={0.08}>
              <div className="cap-top">
                <RefreshCw size={21} />
                <span>02 / ALWAYS IN THE LOOP</span>
              </div>
              <div className="discovery-visual" aria-hidden="true">
                {["web-01", "api-01", "api-02"].map((n, i) => (
                  <div key={n} style={{ animationDelay: `${i * 0.7}s` }}>
                    <Box size={17} />
                    <span>{n}</span>
                    <i />
                    <small>discovered</small>
                  </div>
                ))}
              </div>
              <h3>Containers change. Routes follow.</h3>
              <p>
                Discovery reacts to your Docker lifecycle. Add services and
                scale replicas without hand-editing a route table.
              </p>
              <Link className="text-link" href="/docs/routing/">
                See label discovery <ArrowRight size={14} />
              </Link>
            </Reveal>
            <Reveal className="cap-card cap-balance" delay={0.16}>
              <div className="cap-top">
                <Network size={21} />
                <span>03 / SHARE THE LOAD</span>
              </div>
              <div className="balance-visual" aria-hidden="true">
                <svg viewBox="0 0 300 120" fill="none">
                  <path
                    d="M0 60h80q30 0 50-35t50-20h120M0 60h300M0 60h80q30 0 50 35t50 20h120"
                    stroke="var(--diagram-line)"
                  />
                  <path
                    className="packet-trail"
                    d="M0 60h80q30 0 50-35t50-20h120M0 60h300M0 60h80q30 0 50 35t50 20h120"
                    stroke="var(--amber)"
                    strokeWidth="3"
                    strokeDasharray="9 220"
                  />
                </svg>
                <span>01</span>
                <span>02</span>
                <span>03</span>
              </div>
              <h3>Every replica has a role.</h3>
              <p>
                Round-robin, weighted, IP hash or least connections. Choose the
                strategy that fits each service.
              </p>
              <Link className="text-link" href="/docs/load-balancing/">
                Find your balance <ArrowRight size={14} />
              </Link>
            </Reveal>
          </div>
          <div className="cap-mini">
            {features.map((f) => (
              <div key={f.title}>
                <f.icon size={21} />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="section container">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <i />
                FROM HOSTNAME TO HEALTHY CONTAINER
              </span>
              <h2>
                A route you can follow.
                <br />
                <span>At every step.</span>
              </h2>
            </div>
            <div className="section-intro">
              <p>
                Choose a service. Follow an example request.
                <br />
                See how a handful of labels becomes a route.
              </p>
              <Link className="text-link" href="/docs/observability/">
                Meet the dashboard <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
          <RouteDemo />
        </Reveal>
      </section>
      <section className="quickstart-section" id="quickstart">
        <div className="section container">
          <Reveal>
            <div className="section-heading">
              <div>
                <span className="eyebrow">
                  <i />
                  YOUR NEXT DEPLOY STARTS HERE
                </span>
                <h2>
                  From Docker Compose
                  <br />
                  <span>to “it’s live.”</span>
                </h2>
              </div>
              <p className="section-intro">
                Your server. Your domain. Your containers.
                <br />
                One small router to bring them together.
              </p>
            </div>
            <Quickstart />
          </Reveal>
        </div>
      </section>
      <section className="section container">
        <Reveal>
          <div className="section-heading">
            <div>
              <span className="eyebrow">
                <i />
                ONE BINARY. MANY GOOD REASONS.
              </span>
              <h2>
                Build your stack.
                <br />
                <span>Keep your freedom.</span>
              </h2>
            </div>
            <p className="section-intro">
              Made for the infrastructure you operate.
              <br />
              From a side project to a multi-service host.
            </p>
          </div>
          <div className="scenario-grid">
            {[
              [
                "01",
                "THE SIDE PROJECT",
                "A proper home for your next idea.",
                "Give a personal app its own domain and HTTPS without a second stack of routing configuration.",
                "app.example.com",
              ],
              [
                "02",
                "THE SERVICE STACK",
                "Different services. One front door.",
                "Route your frontend, API and real-time connections by hostname or path on a shared Docker host.",
                "/web → /api → /live",
              ],
              [
                "03",
                "THE SELF-HOSTED SETUP",
                "Infrastructure that stays yours.",
                "Run your own edge, inspect its metrics and follow the source. No hosted control plane required.",
                "your server → your rules",
              ],
            ].map(([n, label, title, text, code]) => (
              <article className="scenario" key={n}>
                <div>
                  <span>{n}</span>
                  <ArrowUpRight size={20} />
                </div>
                <span className="mono">{label}</span>
                <h3>{title}</h3>
                <p>{text}</p>
                <code>{code}</code>
              </article>
            ))}
          </div>
        </Reveal>
      </section>
      <section className="section container faq-section">
        <div>
          <span className="eyebrow">
            <i />A FEW THINGS, ROUTED CLEARLY
          </span>
          <h2>
            Good questions.
            <br />
            <span>Direct answers.</span>
          </h2>
          <p>
            Open source.
            <br />
            Open to your questions.
          </p>
          <a className="text-link" href={`${REPO}/issues`}>
            Let’s talk on GitHub <ArrowUpRight size={15} />
          </a>
        </div>
        <div className="faq-list">
          {faqs.map(([q, a], i) => (
            <details key={q}>
              <summary>
                <span className="mono">0{i + 1}</span>
                {q}
                <ChevronDown size={18} />
              </summary>
              <p>{a}</p>
            </details>
          ))}
        </div>
      </section>
      <section className="container">
        <Reveal className="dock-cta">
          <div className="cta-route-lines" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
          <span className="eyebrow">
            GREAT APPLICATIONS DESERVE A CLEAR PATH.
          </span>
          <h2>
            Less routing around.
            <br />
            More getting there.
          </h2>
          <p>Your next container is ready for the world.</p>
          <div className="hero-buttons">
            <Link className="button ink" href="/docs/getting-started/">
              Let’s ship something <ArrowRight size={17} />
            </Link>
            <a className="button cta-github" href={REPO}>
              <Github size={17} />
              Build with us <ArrowUpRight size={14} />
            </a>
          </div>
          <span className="cta-footnote">
            PURE GO. ZERO DEPENDENCIES. ENTIRELY YOURS.
          </span>
        </Reveal>
      </section>
    </main>
  );
}
