import { ArrowDownToLine } from "lucide-react";
import type { Metadata } from "next";
import { Logo, RiftMark } from "@/components/logo";
export const metadata: Metadata = {
  title: "Brand assets",
  alternates: { canonical: "/brand/" },
};
export default function Brand() {
  return (
    <main id="main" className="container">
      <header className="subpage-header">
        <span className="eyebrow">
          <i />A LITTLE RIFT. A CLEAR IDENTITY.
        </span>
        <h1>Wired to stand out.</h1>
        <p>
          A broken wire. A spark of possibility. Vector assets that stay sharp
          from a browser tab to a 4K display.
        </p>
      </header>
      <div className="brand-grid">
        <article className="brand-card">
          <div className="brand-preview">
            <Logo />
          </div>
          <div className="brand-card-bottom">
            <span>Primary wordmark</span>
            <a href="/logo.svg" download>
              Download SVG <ArrowDownToLine size={15} />
            </a>
          </div>
        </article>
        <article className="brand-card">
          <div className="brand-preview">
            <RiftMark />
          </div>
          <div className="brand-card-bottom">
            <span>WireRift symbol</span>
            <a href="/logo-mark.svg" download>
              Download SVG <ArrowDownToLine size={15} />
            </a>
          </div>
        </article>
      </div>
      <section className="doc-section">
        <h2>A small, intentional palette.</h2>
        <p>
          Amber for the spark. Deep green for the wire. Warm paper for a little
          breathing room.
        </p>
        <div className="brand-colors">
          <div
            className="brand-color"
            style={{ background: "#f5b32c", color: "#1b241d" }}
          >
            Rift amber<code>#F5B32C</code>
          </div>
          <div
            className="brand-color"
            style={{ background: "#1b241d", color: "#fffdf8" }}
          >
            Wire ink<code>#1B241D</code>
          </div>
          <div
            className="brand-color"
            style={{ background: "#fffdf8", color: "#1b241d" }}
          >
            Warm paper<code>#FFFDF8</code>
          </div>
        </div>
        <h2>The name is WireRift.</h2>
        <p>
          Use WireRift in prose and <code>wirerift</code> in commands. Keep the
          mark’s proportions intact, leave clear space around it, and choose a
          background with enough contrast. Please don’t imply an endorsement
          when using these assets.
        </p>
      </section>
    </main>
  );
}
