// Vector reconstruction of the DockRouter reference supplied by the owner.
// Shared by the website, downloadable SVGs, favicon and social preview.
export const anchorGeometry = {
  ring: "M310 56a54 54 0 1 1-108 0 54 54 0 0 1 108 0ZM278 56a22 22 0 1 0-44 0 22 22 0 0 0 44 0Z",
  cross: "M234 102h44v24h66l-36 38h-30v28h-44v-28h-66v-38h66Z",
  anchor:
    "M234 250h44v186l80-49 22 32c-58 38-94 49-124 93-30-44-66-55-105-80-26-17-47-36-63-63l-25 27-8-117 100 60-35 12c24 34 61 57 114 82Z",
  routes:
    "M74 222h364M296 222c30 0 44-15 64-35l42-39M296 222c30 0 44 15 64 35l42 39",
  nodes: [
    { x: 40, y: 222 },
    { x: 426, y: 125 },
    { x: 472, y: 222 },
    { x: 426, y: 318 },
  ],
} as const;
export function routerSymbolSvg(id: string, navy = "#153454") {
  const g = anchorGeometry;
  return `<defs><linearGradient id="${id}-blue" x1="160" y1="0" x2="256" y2="512" gradientUnits="userSpaceOnUse"><stop stop-color="#0879f5"/><stop offset=".55" stop-color="#0870ed"/><stop offset="1" stop-color="#2b43bd"/></linearGradient><clipPath id="${id}-left"><path d="M0 0h256v512H0z"/></clipPath></defs><g fill="${navy}" fill-rule="evenodd"><path d="${g.ring}"/><path d="${g.cross}"/><path d="${g.anchor}"/></g><g fill="url(#${id}-blue)" fill-rule="evenodd" clip-path="url(#${id}-left)"><path d="${g.ring}"/><path d="${g.cross}"/><path d="${g.anchor}"/></g><path d="${g.routes}" stroke="${navy}" stroke-width="32" stroke-linejoin="round"/>${g.nodes.map((p) => `<path fill="#ff7510" fill-rule="evenodd" d="M${p.x + 35} ${p.y}a35 35 0 1 1-70 0 35 35 0 0 1 70 0ZM${p.x + 16} ${p.y}a16 16 0 1 0-32 0 16 16 0 0 0 32 0Z"/>`).join("")}`;
}
