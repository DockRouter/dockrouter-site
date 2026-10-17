// Shared by the React mark and the downloadable SVG artwork.
export const riftGeometry = {
  disc: { cx: 64, cy: 60, r: 44 },
  wires: [
    "M3 34H29C44 34 52 42 61 52L51 48 56 55 46 51 52 59 42 54C35 50 33 44 24 44H3Z",
    "M125 86H101C86 86 77 80 67 68L77 72 72 65 82 69 77 61 87 67C94 73 98 76 106 76H125Z",
  ],
  bolt: "M64 60 49 81 64 77 51 111 74 72 59 76Z",
  rays: [
    { x: 64, y: 52, ex: 69, ey: 26, r: 3.8 },
    { x: 68, y: 52, ex: 89, ey: 9, r: 3 },
    { x: 70, y: 55, ex: 99, ey: 28, r: 2.6 },
    { x: 72, y: 58, ex: 110, ey: 40, r: 3.2 },
    { x: 74, y: 62, ex: 97, ey: 62, r: 4 },
    { x: 60, y: 49, ex: 59, ey: 34, r: 2.8 },
  ],
  arrow: "M79 40 101 16M96 15 107 11 103 23Z",
  sparks: [
    { cx: 82, cy: 29, r: 1.8 },
    { cx: 87, cy: 49, r: 2.1 },
  ],
};

// White signal paths inside the disc turn amber as they leave it.
export function rayEnd(p: { x: number; y: number; ex: number; ey: number }) {
  const dx = p.ex - p.x;
  const dy = p.ey - p.y;
  const x = p.x - 64;
  const y = p.y - 60;
  const a = dx * dx + dy * dy;
  const b = 2 * (x * dx + y * dy);
  const c = x * x + y * y - 44 * 44;
  const t = Math.min(1, (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a));
  return {
    x: p.x + dx * t,
    y: p.y + dy * t,
    outer: Math.hypot(p.ex - 64, p.ey - 60) > 44,
  };
}
