import { ArrowDownToLine } from "lucide-react";
import type { Metadata } from "next";
import { Logo, RouterMark } from "@/components/logo";
export const metadata: Metadata = {
  title: "Brand assets",
  alternates: { canonical: "/brand/" },
};
export default function Brand() {
  return (
    <main id="main" className="container">
      <header className="subpage-header">
        <span className="eyebrow">
          <i /> A CLEAR PATH. A DISTINCT IDENTITY.
        </span>
        <h1>Designed to connect.</h1>
        <p>
          The DockRouter anchor, routing branches and orange connection nodes.
          Faithfully redrawn in SVG from the supplied brand reference, with
          outlined lettering that stays sharp on a 4K screen.
        </p>
      </header>
      <div className="brand-grid">
        {[
          ["Primary wordmark", "/logo.svg"],
          ["Compact symbol", "/logo-mark.svg"],
          ["Stacked identity", "/logo-stacked.svg"],
        ].map(([title, href], i) => (
          <article className="brand-card" key={href}>
            <div className="brand-preview">
              {i === 0 ? (
                <Logo />
              ) : i === 1 ? (
                <RouterMark />
              ) : (
                <picture style={{ background: "#fff" }}>
                  <img
                    src={href}
                    width="400"
                    height="320"
                    alt="DockRouter stacked identity"
                  />
                </picture>
              )}
            </div>
            <div className="brand-card-bottom">
              <span>{title}</span>
              <a href={href} download>
                Download SVG <ArrowDownToLine size={15} />
              </a>
            </div>
          </article>
        ))}
      </div>
      <section className="doc-section">
        <h2>Anchored in blue. Connected in orange.</h2>
        <p>
          Blue anchors the mark. Navy defines the routes and Dock lettering.
          Orange highlights each connection and the Router wordmark.
        </p>
        <div className="brand-colors">
          {[
            ["Anchor blue", "#0879F5", "#03101c"],
            ["Route navy", "#153454", "#fff"],
            ["Connection orange", "#FF7510", "#251c16"],
          ].map(([name, color, ink]) => (
            <div
              key={name}
              className="brand-color"
              style={{ background: color, color: ink }}
            >
              {name}
              <code>{color}</code>
            </div>
          ))}
        </div>
        <h2>Ready for either side of the day.</h2>
        <p>
          Use the light and dark SVG variants for the background you are working
          with. Wordmarks contain outlined type, so they require no installed
          fonts. Keep the proportions and clear space intact.
        </p>
        <div className="hero-buttons">
          <a className="button secondary" href="/logo-dark.svg" download>
            Dark wordmark <ArrowDownToLine size={15} />
          </a>
          <a className="button secondary" href="/logo-mark-dark.svg" download>
            Dark symbol <ArrowDownToLine size={15} />
          </a>
        </div>
      </section>
    </main>
  );
}
