"use client";
import { ArrowDownToLine, ArrowUpRight } from "lucide-react";
import { useState } from "react";
import { REPO, VERSION } from "@/lib/site";
import { Code } from "./code";

const platforms = {
  macOS: {
    id: "darwin",
    archs: [
      ["arm64", "Apple Silicon · M1 and newer"],
      ["amd64", "Intel · x64"],
    ],
  },
  Linux: {
    id: "linux",
    archs: [
      ["amd64", "x64 · Intel / AMD"],
      ["arm64", "ARM64 · Raspberry Pi 64-bit"],
      ["arm", "ARM · 32-bit"],
    ],
  },
  Windows: {
    id: "windows",
    archs: [
      ["amd64", "x64 · Intel / AMD"],
      ["arm64", "ARM64"],
    ],
  },
  FreeBSD: { id: "freebsd", archs: [["amd64", "x64 · Intel / AMD"]] },
};
export function DownloadPicker() {
  const [os, setOS] = useState<keyof typeof platforms>("macOS");
  const [arch, setArch] = useState("arm64");
  const platform = platforms[os];
  const extension = os === "Windows" ? ".exe" : "";
  const client = `wirerift-${platform.id}-${arch}${extension}`;
  const server = `wirerift-server-${platform.id}-${arch}${extension}`;
  const base = `${REPO}/releases/download/v${VERSION}`;
  const command =
    os === "Windows"
      ? `Invoke-WebRequest -Uri "${base}/${client}" -OutFile "wirerift.exe"\n.\\wirerift.exe --help`
      : `curl -fLo wirerift ${base}/${client}\nchmod +x wirerift\nsudo mv wirerift /usr/local/bin/`;
  return (
    <div className="download-card">
      <span className="eyebrow">NATIVE BINARIES / v{VERSION}</span>
      <h2>Made for your machine.</h2>
      <p>
        Choose your platform and architecture. Download the client for your
        workstation, the server for your public edge.
      </p>
      <fieldset className="download-tabs" aria-label="Operating system">
        {(Object.keys(platforms) as Array<keyof typeof platforms>).map(
          (key) => (
            <button
              type="button"
              key={key}
              aria-pressed={os === key}
              onClick={() => {
                setOS(key);
                setArch(platforms[key].archs[0][0]);
              }}
            >
              {key}
            </button>
          ),
        )}
      </fieldset>
      <label className="architecture-select">
        Processor architecture
        <select value={arch} onChange={(e) => setArch(e.target.value)}>
          {platform.archs.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </label>
      <div className="download-links">
        <a href={`${base}/${client}`}>
          <span>
            <strong>Download client</strong>
            <small>
              {platform.id} · {arch}
              {extension}
            </small>
          </span>
          <ArrowDownToLine size={20} />
        </a>
        <a href={`${base}/${server}`}>
          <span>
            <strong>Download server</strong>
            <small>
              {platform.id} · {arch}
              {extension}
            </small>
          </span>
          <ArrowDownToLine size={20} />
        </a>
      </div>
      <Code title={os === "Windows" ? "PowerShell" : "terminal"}>
        {command}
      </Code>
      <p className="code-note">
        Verify your download against{" "}
        <a href={`${base}/checksums.txt`}>
          checksums.txt <ArrowUpRight size={12} />
        </a>
      </p>
    </div>
  );
}
