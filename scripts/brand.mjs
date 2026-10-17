import { writeFile } from "node:fs/promises";
import { openSync } from "fontkit";
import sharp from "sharp";

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
const tagline = outline("YOUR CONTAINERS. CONNECTED.", 14, 0.8);
const glyphs = (data, baseline) =>
  data.paths
    .map(
      (p) =>
        `<path d="${p.d}" transform="translate(${p.x} ${baseline - p.y}) scale(${data.scale} ${-data.scale})"/>`,
    )
    .join("");
const symbol = (paper) =>
  `<path d="M8 18h16l8 14-8 14H8l8-14z" fill="currentColor"/><path d="M56 18H40l-8 14 8 14h16l-8-14z" fill="#f05b35"/><path d="M24 8h16M24 56h16" stroke="currentColor" stroke-width="4"/><circle cx="32" cy="32" r="4" fill="${paper}"/>`;
const svg = (box, ink, body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${box}" fill="none" color="${ink}"><title>DockRouter</title>${body}</svg>`;
await writeFile(
  "src/lib/wordmark.ts",
  `// Generated from Geist (OFL) by scripts/brand.mjs.\nexport const wordmark = ${JSON.stringify(word)} as const;\n`,
);
for (const [suffix, ink, paper] of [
  ["", "#252721", "#faf9f6"],
  ["-dark", "#efeee8", "#202120"],
]) {
  await writeFile(
    `public/logo-mark${suffix}.svg`,
    svg("0 0 64 64", ink, symbol(paper)),
  );
  await writeFile(
    `public/logo${suffix}.svg`,
    svg(
      `0 0 ${word.width + 80} 64`,
      ink,
      `${symbol(paper)}<g fill="currentColor" transform="translate(80 0)">${glyphs(word, 51)}</g>`,
    ),
  );
  await writeFile(
    `public/logo-stacked${suffix}.svg`,
    svg(
      "0 0 480 320",
      ink,
      `<g transform="translate(176 12) scale(2)">${symbol(paper)}</g><g transform="translate(${(480 - word.width) / 2} 175)" fill="currentColor">${glyphs(word, 51)}</g><g transform="translate(${(480 - tagline.width) / 2} 265)" fill="currentColor">${glyphs(tagline, 14)}</g>`,
    ),
  );
}
const favicon = svg(
  "0 0 64 64",
  "#252721",
  `<rect width="64" height="64" rx="12" fill="#faf9f6"/>${symbol("#faf9f6")}`,
);
await writeFile("public/favicon.svg", favicon);
await sharp(Buffer.from(favicon))
  .resize(180)
  .png()
  .toFile("public/apple-touch-icon.png");
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630"><rect width="1200" height="630" fill="#faf9f6"/><path d="M0 580h1200" stroke="#dfdfd7"/><g transform="translate(850 170) scale(4)" color="#252721">${symbol("#faf9f6")}</g><g transform="translate(72 50) scale(.48)" fill="#252721">${glyphs(word, 51)}</g><text x="72" y="270" fill="#252721" font-family="Arial,sans-serif" font-size="78" font-weight="600" letter-spacing="-4">Your containers.</text><text x="72" y="360" fill="#b63718" font-family="Arial,sans-serif" font-size="78" font-weight="600" letter-spacing="-4">Already connected.</text><text x="76" y="435" fill="#696b63" font-family="Arial,sans-serif" font-size="24">Docker-native ingress. Automatic TLS. Pure Go.</text><text x="76" y="540" fill="#696b63" font-family="monospace" font-size="16">ZERO DEPENDENCIES / MIT LICENSED / DOCKROUTER.COM</text></svg>`;
await sharp(Buffer.from(og)).png().toFile("public/og.png");
await sharp(Buffer.from(svg("0 0 64 64", "#252721", symbol("#faf9f6"))))
  .resize(640)
  .flatten({ background: "#faf9f6" })
  .png()
  .toFile("public/logo-preview.png");
