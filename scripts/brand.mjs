import { writeFile } from "node:fs/promises";
import { openSync } from "fontkit";
import sharp from "sharp";
import { routerSymbolSvg } from "../src/lib/brand-geometry.ts";
import { generateOg } from "./og.mjs";

const font = openSync(
  "node_modules/@fontsource/geist/files/geist-latin-700-normal.woff",
);
function outline(text, size, tracking = 0) {
  const run = font.layout(text);
  const scale = size / font.unitsPerEm;
  let cursor = 0;
  const paths = run.glyphs.map((g, i) => {
    const p = run.positions[i];
    const path = {
      d: g.path.toSVG(),
      x: +(cursor + p.xOffset * scale).toFixed(3),
      y: +(p.yOffset * scale).toFixed(3),
    };
    cursor += p.xAdvance * scale + tracking;
    return path;
  });
  return { paths, width: +(cursor - tracking).toFixed(3), scale };
}
const word = outline("DockRouter", 64, -1.4);
const glyphs = (navy) =>
  word.paths
    .map(
      (p, i) =>
        `<path fill="${i < 4 ? navy : "#ff7510"}" d="${p.d}" transform="translate(${p.x} ${51 - p.y}) scale(${word.scale} ${-word.scale})"/>`,
    )
    .join("");
const svg = (box, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none"><title>DockRouter</title>${body}</svg>`;
await writeFile(
  "src/lib/wordmark.ts",
  `// Generated from Geist (OFL) by scripts/brand.mjs.\nexport const wordmark = ${JSON.stringify(word)} as const;\n`,
);
for (const [suffix, navy] of [
  ["", "#153454"],
  ["-dark", "#c4d7f0"],
]) {
  await writeFile(
    `public/logo-mark${suffix}.svg`,
    svg("0 0 512 512", routerSymbolSvg("anchor", navy)),
  );
  await writeFile(
    `public/logo${suffix}.svg`,
    svg(
      `0 0 ${word.width + 80} 64`,
      `<g transform="scale(.125)">${routerSymbolSvg("anchor", navy)}</g><g transform="translate(80 0)">${glyphs(navy)}</g>`,
    ),
  );
  await writeFile(
    `public/logo-stacked${suffix}.svg`,
    svg(
      "0 0 1024 1024",
      `<g transform="translate(256 192)">${routerSymbolSvg("anchor", navy)}</g><g transform="translate(112 733) scale(${800 / word.width})">${glyphs(navy)}</g>`,
    ),
  );
}
const favicon = svg(
  "0 0 560 560",
  `<rect width="560" height="560" rx="84" fill="#fff"/><g transform="translate(24 24)">${routerSymbolSvg("favicon")}</g>`,
);
await writeFile("public/favicon.svg", favicon);
await sharp(Buffer.from(favicon))
  .resize(180)
  .png()
  .toFile("public/apple-touch-icon.png");
await generateOg();
await sharp(Buffer.from(svg("0 0 512 512", routerSymbolSvg("preview"))))
  .resize(640)
  .flatten({ background: "#fff" })
  .png()
  .toFile("public/logo-preview.png");
