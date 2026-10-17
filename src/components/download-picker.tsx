"use client";
import { ArrowDownToLine, ArrowUpRight, Box } from "lucide-react";
import { useState } from "react";
import { REPO, VERSION } from "@/lib/site";
export function DownloadPicker() {
  const [os, setOs] = useState("linux");
  const [arch, setArch] = useState("amd64");
  const file = `dockrouter_${VERSION}_${os}_${arch}.${os === "windows" ? "zip" : "tar.gz"}`;
  return (
    <div className="download-card">
      <span className="eyebrow">
        <Box size={15} /> ONE BINARY. YOUR PLATFORM.
      </span>
      <div className="download-platforms">
        {[
          ["linux", "Linux"],
          ["darwin", "macOS"],
          ["windows", "Windows"],
        ].map(([value, label]) => (
          <button
            type="button"
            className={os === value ? "active" : ""}
            key={value}
            aria-pressed={os === value}
            onClick={() => setOs(value)}
          >
            {label}
          </button>
        ))}
      </div>
      <label className="architecture-label" htmlFor="architecture">
        Processor architecture
      </label>
      <select
        id="architecture"
        value={arch}
        onChange={(e) => setArch(e.target.value)}
      >
        <option value="amd64">amd64 · Intel / AMD 64-bit</option>
        <option value="arm64">arm64 · Apple Silicon / ARM 64-bit</option>
      </select>
      <p className="download-note">{file}</p>
      <a
        className="button primary"
        href={`${REPO}/releases/download/v${VERSION}/${file}`}
      >
        <ArrowDownToLine size={16} />
        Download DockRouter <ArrowUpRight size={14} />
      </a>
      <p className="download-note">
        Verify the archive against{" "}
        <a href={`${REPO}/releases/download/v${VERSION}/checksums.txt`}>
          checksums.txt ↗
        </a>{" "}
        from the same release. These are direct GitHub release downloads.
      </p>
    </div>
  );
}
