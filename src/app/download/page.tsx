import { ArrowRight, ArrowUpRight } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Code } from "@/components/code";
import { DownloadPicker } from "@/components/download-picker";
import { REPO, VERSION } from "@/lib/site";
export const metadata: Metadata = {
  title: "Download",
  description:
    "Download DockRouter for Linux, macOS and Windows, or deploy it with Docker.",
  alternates: { canonical: "/download/" },
};
export default function Download() {
  return (
    <main id="main" className="container">
      <header className="subpage-header">
        <span className="eyebrow">
          <i /> SMALL DOWNLOAD. CLEAR DIRECTION.
        </span>
        <h1>
          Your next deployment
          <br />
          starts here.
        </h1>
        <p>
          Run the Docker image or pick a native binary. Same small router. Same
          clear path to your containers.
        </p>
      </header>
      <div className="download-layout">
        <DownloadPicker />
        <aside className="download-aside">
          <span className="release-label">VERIFIED RELEASE / v{VERSION}</span>
          <h2>Docker is a good place to start.</h2>
          <p>
            Keep the router alongside your services. Publish ports 80 and 443,
            mount the Docker socket and persist /data.
          </p>
          <Code title="Docker image">
            docker pull dockrouter/dockrouter:latest
          </Code>
          <Link className="text-link" href="/docs/getting-started/">
            Use the complete Compose example <ArrowRight size={15} />
          </Link>
          <hr />
          <h2>Prefer to build from source?</h2>
          <p>
            Use Go 1.22 or later and the upstream source. No third-party Go
            packages are required.
          </p>
          <Link className="text-link" href="/docs/installation/#source">
            Build the binary <ArrowRight size={15} />
          </Link>
          <a className="button secondary" href={`${REPO}/releases`}>
            All releases <ArrowUpRight size={14} />
          </a>
        </aside>
      </div>
    </main>
  );
}
