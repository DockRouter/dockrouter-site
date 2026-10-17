import { ArrowUpRight, Github } from "lucide-react";
import Link from "next/link";
import { REPO, SITE_REPO } from "@/lib/site";
import { Logo } from "./logo";
import { OxogMark } from "./oxog-mark";

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-main">
        <div className="footer-brand">
          <Link href="/" aria-label="DockRouter home">
            <Logo />
          </Link>
          <p>
            Docker by nature.
            <br />
            Connected by design.
          </p>
          <span className="built-go">
            <i />
            Built in Go. Open by design.
          </span>
        </div>
        <div className="footer-column">
          <h3>DockRouter</h3>
          <Link href="/#features">Features</Link>
          <Link href="/#how-it-works">How it works</Link>
          <Link href="/download/">Downloads</Link>
          <Link href="/changelog/">What’s new</Link>
        </div>
        <div className="footer-column">
          <h3>For developers</h3>
          <Link href="/docs/getting-started/">Documentation</Link>
          <Link href="/docs/installation/">Installation</Link>
          <Link href="/docs/observability/">API & metrics</Link>
          <Link href="/docs/security/">Security</Link>
        </div>
        <div className="footer-column">
          <h3>Open source</h3>
          <a href={REPO}>
            GitHub <ArrowUpRight size={12} />
          </a>
          <a href={`${REPO}/issues`}>Report an issue</a>
          <Link href="/brand/">Brand assets</Link>
          <a href={`${REPO}/blob/main/LICENSE`}>MIT license</a>
        </div>
      </div>
      <section
        className="studio-section container"
        aria-labelledby="studio-heading"
      >
        <div className="studio-card">
          <a
            className="studio-logo-link"
            href="https://oxog.net/"
            aria-label="Visit OXOGNET"
          >
            <OxogMark />
          </a>
          <div className="studio-copy">
            <span className="eyebrow">THE PEOPLE BEHIND THE CONNECTION</span>
            <p>DockRouter is part of the</p>
            <h2 id="studio-heading">
              <a href="https://oxog.net/">
                oxog<span>net</span>
                <span className="studio-dot">.</span>
                <ArrowUpRight size={22} />
              </a>
            </h2>
            <p>
              An independent studio in Estonia building AI agents, developer
              tools and the infrastructure behind them. A shared curiosity. A
              whole ecosystem of ideas.
            </p>
            <a className="studio-explore" href="https://oxog.net/projects">
              Explore the OXOGNET ecosystem <ArrowUpRight size={14} />
            </a>
          </div>
          <nav className="studio-projects" aria-label="More from OXOGNET">
            {[
              ["AGEZT", "An agentic operating system", "agezt"],
              ["WrongStack", "AI coding orchestration", "wrongstack"],
              ["WrongTrace", "Agent observability", "wrongtrace"],
              ["NineDeploy", "Self-hosted deployment", "ninedeploy"],
            ].map(([name, description, slug]) => (
              <a key={slug} href={`https://oxog.net/projects/${slug}`}>
                <span>
                  <strong>{name}</strong>
                  <small>{description}</small>
                </span>
                <ArrowUpRight size={14} />
              </a>
            ))}
          </nav>
        </div>
        <div className="studio-signature">
          <span>OXOGNET OÜ</span>
          <span>Made in Estonia. Built for the world.</span>
        </div>
      </section>
      <div className="container footer-bottom">
        <span>© {new Date().getUTCFullYear()} DockRouter contributors</span>
        <span className="footer-bottom-links">
          <a href={`${REPO}/blob/main/LICENSE`}>MIT licensed</a>
          <a href={SITE_REPO}>
            Website source <ArrowUpRight size={12} />
          </a>
          <a href={REPO} aria-label="DockRouter on GitHub">
            <Github size={17} />
          </a>
        </span>
      </div>
    </footer>
  );
}
