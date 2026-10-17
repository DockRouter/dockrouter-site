import { mkdir, writeFile } from "node:fs/promises";
import sharp from "sharp";

const symbol = `<circle cx="40" cy="40" r="30" fill="#F5AD21"/><path d="M2 25h15c11 0 18 15 25 19l-10-2 5 9C26 46 22 35 14 35H2zM78 55H63c-11 0-18-15-25-19l10 2-5-9c11 5 15 16 23 16h12z" fill="currentColor"/><path d="m47 10-8 24 11-3-16 20 9-3-11 24 2-22-10 4 15-22-9 2z" fill="CUT"/><path d="m48 12-9 24 10-3-14 18 8-3-11 22" stroke="currentColor" stroke-width="2.4" stroke-linejoin="round"/><g stroke="CUT" stroke-width="1.8"><path d="m45 31 17-14M47 35l19-5M43 27l8-15"/></g><g fill="CUT"><circle cx="63" cy="16" r="2.8"/><circle cx="68" cy="29" r="2.8"/><circle cx="52" cy="10" r="2.8"/></g>`;
const mark = (ink, cut) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80" fill="none" color="${ink}"><title>WireRift</title>${symbol.replaceAll("CUT", cut)}</svg>`;
await mkdir("public", { recursive: true });
await writeFile("public/logo-mark.svg", mark("#1b241d", "#fffdf8"));
await writeFile("public/logo-mark-dark.svg", mark("#edf0e8", "#111310"));
for (const [suffix, ink, cut] of [
  ["", "#1b241d", "#fffdf8"],
  ["-dark", "#edf0e8", "#111310"],
]) {
  await writeFile(
    `public/logo${suffix}.svg`,
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 370 90" fill="none" color="${ink}"><title>WireRift</title><g transform="translate(0 5)">${symbol.replaceAll("CUT", cut)}</g><text x="95" y="64" font-family="Arial,Helvetica,sans-serif" font-size="64" font-weight="700" letter-spacing="-4" fill="${ink}">wire<tspan font-weight="400">rift</tspan><tspan fill="#c18b19">.</tspan></text></svg>`,
  );
}
await sharp(Buffer.from(mark("#1b241d", "#fffdf8")))
  .resize(180, 180)
  .flatten({ background: "#fffdf8" })
  .png()
  .toFile("public/apple-touch-icon.png");
const og = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630"><rect width="1200" height="630" fill="#fffdf8"/><defs><pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse"><path d="M40 0H0v40" fill="none" stroke="#e9e9df" stroke-width="1"/></pattern></defs><rect x="650" width="550" height="630" fill="url(#grid)"/><g transform="translate(800 175) scale(3)" color="#1b241d">${symbol.replaceAll("CUT", "#fffdf8")}</g><text x="72" y="105" font-family="Arial,sans-serif" font-weight="700" font-size="35" fill="#1b241d">wirerift.</text><text x="72" y="265" font-family="Arial,sans-serif" font-size="88" font-weight="700" letter-spacing="-5" fill="#1b241d">Localhost.</text><text x="72" y="360" font-family="Arial,sans-serif" font-size="88" font-weight="700" letter-spacing="-5" fill="#88600b">Meet the world.</text><text x="76" y="440" font-family="Arial,sans-serif" font-size="25" fill="#636c61">Open-source tunnels. Your infrastructure. Your rules.</text><rect x="75" y="501" width="460" height="52" rx="6" fill="#f5b32c"/><text x="98" y="535" font-family="monospace" font-size="19" fill="#1b241d">Pure Go · Zero dependencies · Self-hosted</text></svg>`;
await sharp(Buffer.from(og)).png().toFile("public/og.png");
console.log("Generated SVG logos, social card and app icon.");
