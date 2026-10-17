import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { REPO, VERSION } from "@/lib/site";
export const metadata: Metadata = {
  title: "Changelog",
  alternates: { canonical: "/changelog/" },
};
export default function Changelog() {
  return (
    <main id="main" className="container">
      <header className="subpage-header">
        <span className="eyebrow">
          <i />
          THE CONNECTION KEEPS GETTING BETTER
        </span>
        <h1>
          Built in the open.
          <br />
          Always moving.
        </h1>
        <p>
          Follow DockRouter’s releases, inspect what changed, and find the right
          version for your infrastructure.
        </p>
      </header>
      <div className="release-layout">
        <article className="release-card">
          <span className="release-label">LATEST VERIFIED RELEASE</span>
          <h2>DockRouter v{VERSION}</h2>
          <p>
            The latest release verified when this website was built. Find the
            authoritative release notes, binaries and checksums on GitHub.
          </p>
          <p>
            Native binary archives are available for Linux, macOS and Windows,
            on amd64 and arm64 architectures.
          </p>
          <a
            href={`${REPO}/releases/tag/v${VERSION}`}
            className="button primary"
          >
            Read the release notes <ArrowUpRight size={16} />
          </a>
          <Link href="/download/" className="button secondary">
            Get the binary <ArrowRight size={16} />
          </Link>
        </article>
        <article className="release-card">
          <h2>Every change has a trail.</h2>
          <p>
            Browse the full release history for version-specific behavior, and
            follow the source commits for changes that have not yet shipped.
          </p>
          <a href={`${REPO}/releases`} className="text-link">
            All releases <ArrowUpRight size={15} />
          </a>
          <br />
          <a href={`${REPO}/commits/main/`} className="text-link">
            Source history <ArrowUpRight size={15} />
          </a>
        </article>
      </div>
    </main>
  );
}
