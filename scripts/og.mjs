import { writeFile } from "node:fs/promises";
import { pathToFileURL } from "node:url";
import { openSync } from "fontkit";
import sharp from "sharp";
import { routerSymbolSvg } from "../src/lib/brand-geometry.ts";

// Outline all lettering so previews are identical on every rendering host.
const font = openSync(
  "node_modules/@fontsource/geist/files/geist-latin-700-normal.woff",
);
function lettering(text, x, y, size, fill, tracking = 0) {
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  let cursor = x;
  return run.glyphs
    .map((glyph, index) => {
      const position = run.positions[index];
      const path = `<path d="${glyph.path.toSVG()}" fill="${fill}" transform="translate(${cursor + position.xOffset * scale} ${y - position.yOffset * scale}) scale(${scale} ${-scale})"/>`;
      cursor += position.xAdvance * scale + tracking;
      return path;
    })
    .join("");
}

export async function generateOg() {
  const navy = "#153454";
  const blue = "#0868db";
  const muted = "#5c7189";
  const orange = "#ff7510";
  const dockWidth = font
    .layout("Dock")
    .positions.reduce(
      (width, position) =>
        width + (position.xAdvance * 38) / font.unitsPerEm - 1,
      0,
    );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <title>DockRouter — Stop configuring. Start shipping.</title>
    <defs>
      <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
        <circle cx="1" cy="1" r="1" fill="#c4d7f0" opacity=".15"/>
      </pattern>
    </defs>
    <rect width="1200" height="630" fill="#f7f9fd"/>
    <rect x="800" width="400" height="630" fill="${navy}"/>
    <rect x="800" width="400" height="630" fill="url(#grid)"/>
    <path d="M64 118h672" stroke="#dce4ef"/>
    <rect x="64" y="54" width="4" height="33" rx="2" fill="${orange}"/>
    ${lettering("Dock", 82, 84, 38, navy, -1)}
    ${lettering("Router", 82 + dockWidth, 84, 38, orange, -1)}
    ${lettering("THE DOCKER-NATIVE INGRESS ROUTER", 64, 177, 12, muted, 1.2)}
    ${lettering("Stop configuring.", 60, 279, 76, navy, -3.3)}
    ${lettering("Start shipping.", 60, 364, 76, blue, -3.3)}
    ${lettering("Your containers. A clear way in.", 64, 420, 23, muted, -0.5)}
    <path d="M64 478h672" stroke="#dce4ef"/>
    <g fill="none" stroke="${orange}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">
      <path d="m65 512 4 4 7-8M241 512l4 4 7-8M435 512l4 4 7-8"/>
    </g>
    ${lettering("Automatic TLS", 87, 519, 17, navy, -0.3)}
    ${lettering("Zero dependencies", 263, 519, 17, navy, -0.3)}
    ${lettering("Pure Go", 457, 519, 17, navy, -0.3)}
    ${lettering("dockrouter.com", 64, 587, 17, muted, -0.3)}
    ${lettering("OPEN SOURCE / MIT", 570, 587, 11, muted, 0.5)}
    ${lettering("A CLEAR WAY IN.", 850, 83, 12, "#c4d7f0", 1.2)}
    <path d="M850 118h300M850 478h300" stroke="#c4d7f0" stroke-opacity=".17"/>
    <g transform="translate(855 169) scale(.56)">${routerSymbolSvg("og-anchor", "#c4d7f0")}</g>
    <circle cx="858" cy="514" r="4" fill="${orange}"/>
    ${lettering("LABELS IN. LIVE ROUTES OUT.", 874, 518, 10, "#c4d7f0", 0.55)}
    ${lettering(":80", 850, 587, 12, "#c4d7f0", 0.3)}
    ${lettering(":443", 1104, 587, 12, "#c4d7f0", 0.3)}
    <path d="M894 583h183m-7-5 7 5-7 5" fill="none" stroke="#c4d7f0" stroke-opacity=".45"/>
  </svg>`;
  await writeFile(
    "public/og.png",
    await sharp(Buffer.from(svg)).png().toBuffer(),
  );
}

if (
  process.argv[1] &&
  import.meta.url === pathToFileURL(process.argv[1]).href
) {
  await generateOg();
}
