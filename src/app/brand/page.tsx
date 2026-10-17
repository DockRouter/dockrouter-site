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
          Two directions. One connection. An original vector identity for
          DockRouter, sharp from the smallest browser tab to a 4K screen.
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
                <picture>
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
        <h2>A little warmth. A clear signal.</h2>
        <p>
          Signal orange marks the connection. Graphite gives the identity its
          structure. Warm paper leaves room to breathe.
        </p>
        <div className="brand-colors">
          {[
            ["Signal orange", "#F05B35", "#251c16"],
            ["Graphite", "#252721", "#fff"],
            ["Warm paper", "#FAF9F6", "#252721"],
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
