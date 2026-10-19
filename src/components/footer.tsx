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
      <div className="container oxog-studio-section">
        <a className="oxog-studio" href="https://oxog.net">
          <OxogMark />
          <div>
            <span className="eyebrow">PART OF A BIGGER PICTURE</span>
            <h2 id="studio-heading">
              Small studio. <span>Big ideas.</span>
            </h2>
            <p>Explore the tools and infrastructure from Oxog.</p>
          </div>
          <span className="oxog-studio-link">
            Meet oxog.net <ArrowUpRight size={18} />
          </span>
        </a>
      </div>
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
