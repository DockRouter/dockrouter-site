export const HERO_NETWORK = {
  spacing: 250,
  maxColumns: 13,
  mobileColumns: 4,
  desktopRows: 5,
  mobileRows: 4,
  maxDpr: 2,
  maxPixels: 5_000_000,
  activeFps: 60,
  idleFps: 30,
  idleAfter: 4,
  pointerRadius: 190,
  displacement: 30,
  packetSpeed: 42,
  maxWaves: 5,
  maxSparks: 32,
  maxTrails: 9,
  waveLife: 1.65,
  waveRadius: 230,
  sparkLife: 1.1,
  trailLife: 0.7,
  light: { line: "#759ac8", blue: "#0868db", orange: "#ec6c0a" },
  dark: { line: "#557cab", blue: "#79b6ff", orange: "#ff9c50" },
} as const;

export type HeroNetworkConfig = {
  [Key in keyof typeof HERO_NETWORK]: Key extends "light" | "dark"
    ? { line: string; blue: string; orange: string }
    : number;
};

type Mode = "running" | "paused" | "reduced" | "offscreen" | "hidden";
type Point = { x: number; y: number };
type Port = Point & { bx: number; by: number; depth: number; seed: number };
type Edge = { from: Port; to: Port; seed: number };
type Wave = Point & { age: number; variant: number };
type Spark = Point & { age: number; vx: number; vy: number };
type Trail = Point & { age: number };

const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const smooth = (value: number) => value * value * (3 - 2 * value);
const controlSelector =
  "a,button,input,select,textarea,summary,[role=button],[data-scene-ignore],.dock-hero-copy,.hero-routing";

/** Canvas owns its frame data. React only receives lifecycle changes. */
export function createHeroNetwork(
  canvas: HTMLCanvasElement,
  host: HTMLElement,
  onMode: (mode: Mode) => void,
  config: HeroNetworkConfig = HERO_NETWORK,
) {
  const context = canvas.getContext("2d");
  if (!context) return { setPaused() {}, destroy() {} };
  const ctx = context;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const systemTheme = matchMedia("(prefers-color-scheme: dark)");
  let width = 0;
  let height = 0;
  let ratio = 1;
  let ports: Port[] = [];
  let edges: Edge[] = [];
  let waves: Wave[] = [];
  let sparks: Spark[] = [];
  let trails: Trail[] = [];
  let quiet = { x: 0, y: 0, right: 0, bottom: 0 };
  let visible = false;
  let paused = false;
  let destroyed = false;
  let frame = 0;
  let previous = 0;
  let elapsed = 0;
  let lastInput = -10;
  let lastTrail = -10;
  let lastBurst = -10;
  let burstIndex = 0;
  let pointerWeight = 0;
  let activity = 0.36;
  let currentMode: Mode | undefined;
  let dark = false;
  let pointer = { x: -1000, y: -1000, inside: false };
  let down: (Point & { id: number; time: number }) | null = null;

  function edgePoint(edge: Edge, t: number): Point {
    const { from: a, to: b } = edge;
    const middle = (a.x + b.x) / 2;
    const u = 1 - t;
    return {
      x:
        u ** 3 * a.x +
        3 * u ** 2 * t * middle +
        3 * u * t ** 2 * middle +
        t ** 3 * b.x,
      y:
        u ** 3 * a.y +
        3 * u ** 2 * t * a.y +
        3 * u * t ** 2 * b.y +
        t ** 3 * b.y,
    };
  }
  function path(edge: Edge) {
    const middle = (edge.from.x + edge.to.x) / 2;
    ctx.beginPath();
    ctx.moveTo(edge.from.x, edge.from.y);
    ctx.bezierCurveTo(
      middle,
      edge.from.y,
      middle,
      edge.to.y,
      edge.to.x,
      edge.to.y,
    );
  }
  function opacityAt(x: number, y: number) {
    const edgeFade = smooth(clamp(Math.min(x, width - x, y, height - y) / 54));
    const outside = Math.max(
      quiet.x - x,
      x - quiet.right,
      quiet.y - y,
      y - quiet.bottom,
    );
    return edgeFade * (0.12 + 0.88 * smooth(clamp(outside / 85)));
  }
  function readTheme() {
    const theme = document.documentElement.dataset.theme;
    dark = theme === "dark" || (theme !== "light" && systemTheme.matches);
    if (!frame) paint(0);
  }
  function resize() {
    const box = host.getBoundingClientRect();
    width = box.width;
    height = box.height;
    if (!width || !height) return;
    ratio = Math.min(
      devicePixelRatio || 1,
      width < 800 ? 1.5 : config.maxDpr,
      Math.sqrt(config.maxPixels / (width * height)),
    );
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    const copy = host.querySelector(".dock-hero-copy")?.getBoundingClientRect();
    if (copy)
      quiet = {
        x: copy.left - box.left - 12,
        y: copy.top - box.top - 12,
        right: copy.right - box.left + 12,
        bottom: copy.bottom - box.top + 12,
      };
    const columns =
      width < 800
        ? config.mobileColumns
        : Math.min(
            config.maxColumns,
            Math.max(5, Math.round(width / config.spacing) + 1),
          );
    const rows = width < 800 ? config.mobileRows : config.desktopRows;
    ports = [];
    edges = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const seed = row * columns + column;
        const x = (column / (columns - 1)) * (width + 90) - 45;
        const y =
          (0.08 + (row / (rows - 1)) * 0.83) * height +
          Math.sin(column * 1.8 + row * 2) * 26;
        ports.push({ bx: x, by: y, x, y, seed, depth: 0.4 + (seed % 4) * 0.2 });
      }
    }
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns - 1; column++) {
        const index = row * columns + column;
        edges.push({ from: ports[index], to: ports[index + 1], seed: index });
        if ((column + row) % 3 === 1 && row < rows - 1) {
          edges.push({
            from: ports[index],
            to: ports[index + columns + 1],
            seed: index + 0.5,
          });
        }
      }
    }
    waves = [];
    sparks = [];
    trails = [];
    paint(0);
  }
  function paint(dt: number) {
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    ctx.clearRect(0, 0, width, height);
    const reduced = reduce.matches;
    const colors = dark ? config.dark : config.light;
    const idle = elapsed - lastInput > config.idleAfter;
    activity += ((idle ? 0.36 : 1) - activity) * (1 - Math.exp(-dt * 2));
    const energy = reduced ? 0 : activity;
    const intro = reduced ? 1 : smooth(clamp(elapsed / 1.4));
    pointerWeight +=
      ((pointer.inside && !reduced ? 1 : 0) - pointerWeight) *
      (1 - Math.exp(-dt * 5));
    for (const port of ports) {
      const dx = port.bx - pointer.x;
      const dy = port.by - pointer.y;
      const distance = Math.hypot(dx, dy);
      const force =
        (1 - clamp(distance / config.pointerRadius)) ** 2 * pointerWeight;
      let impulseX = 0;
      let impulseY = 0;
      for (const wave of waves) {
        const distance = Math.hypot(port.bx - wave.x, port.by - wave.y);
        const radius =
          config.waveRadius * (1 - (1 - wave.age / config.waveLife) ** 3);
        const power =
          Math.exp(-(((distance - radius) / 36) ** 2)) *
          (1 - wave.age / config.waveLife) *
          15;
        impulseX += ((port.bx - wave.x) / Math.max(distance, 1)) * power;
        impulseY += ((port.by - wave.y) / Math.max(distance, 1)) * power;
      }
      const targetX =
        port.bx +
        Math.sin(elapsed * 0.14 + port.seed) * 5 * port.depth * energy +
        (dx / Math.max(distance, 1)) * force * config.displacement +
        impulseX;
      const targetY =
        port.by +
        Math.cos(elapsed * 0.17 + port.seed) * 8 * port.depth * energy +
        (dy / Math.max(distance, 1)) * force * config.displacement +
        impulseY;
      const easing = reduced || dt === 0 ? 1 : 1 - Math.exp(-dt * 6);
      port.x += (targetX - port.x) * easing;
      port.y += (targetY - port.y) * easing;
    }
    ctx.lineWidth = 1;
    ctx.lineCap = "round";
    for (const edge of edges) {
      const middle = edgePoint(edge, 0.5);
      const alpha = opacityAt(middle.x, middle.y);
      ctx.globalAlpha = alpha * (dark ? 0.45 : 0.37) * (reduced ? 0.7 : intro);
      ctx.strokeStyle = colors.line;
      path(edge);
      ctx.stroke();
      if (!reduced && Number.isInteger(edge.seed)) {
        const length = Math.hypot(
          edge.to.x - edge.from.x,
          edge.to.y - edge.from.y,
        );
        const t =
          ((elapsed * config.packetSpeed * (0.65 + (edge.seed % 4) * 0.16)) /
            Math.max(length, 1) +
            edge.seed * 0.317) %
          1;
        const point = edgePoint(edge, t);
        const tail = edgePoint(edge, Math.max(0, t - 0.06));
        ctx.globalAlpha =
          opacityAt(point.x, point.y) *
          intro *
          (0.28 + energy * 0.47) *
          Math.sin(t * Math.PI);
        ctx.strokeStyle = edge.seed % 5 === 0 ? colors.orange : colors.blue;
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(tail.x, tail.y);
        ctx.lineTo(point.x, point.y);
        ctx.stroke();
        ctx.lineWidth = 1;
      }
    }
    for (const port of ports) {
      ctx.globalAlpha =
        opacityAt(port.x, port.y) * (reduced ? 0.45 : intro * 0.65);
      ctx.strokeStyle = port.seed % 3 === 0 ? colors.orange : colors.blue;
      ctx.beginPath();
      if (port.seed % 3 === 0) ctx.arc(port.x, port.y, 3.5, 0, Math.PI * 2);
      else ctx.roundRect(port.x - 3, port.y - 3, 6, 6, 1.5);
      ctx.stroke();
    }
    for (const trail of trails) {
      trail.age += dt;
      const life = clamp(trail.age / config.trailLife);
      ctx.globalAlpha = (1 - life) ** 2 * 0.24 * opacityAt(trail.x, trail.y);
      ctx.strokeStyle = colors.blue;
      ctx.beginPath();
      ctx.arc(trail.x, trail.y, 5 + life * 17, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (const wave of waves) {
      wave.age += dt;
      const life = clamp(wave.age / config.waveLife);
      const radius = config.waveRadius * (1 - (1 - life) ** 3);
      const fade = (1 - life) ** 2;
      // Fade the entire interaction at the scene boundary, including large rings.
      const boundary = clamp(
        Math.min(wave.x, width - wave.x, wave.y, height - wave.y) /
          Math.max(radius, 1),
      );
      ctx.globalAlpha = fade * 0.6 * boundary;
      ctx.strokeStyle = wave.variant === 1 ? colors.orange : colors.blue;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, Math.max(1, radius), 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha *= 0.45;
      ctx.setLineDash(wave.variant === 2 ? [6, 12] : []);
      ctx.beginPath();
      ctx.arc(wave.x, wave.y, Math.max(1, radius * 0.72), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.lineWidth = 1;
    for (const spark of sparks) {
      spark.age += dt;
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx *= Math.exp(-dt * 3.2);
      spark.vy *= Math.exp(-dt * 3.2);
      ctx.globalAlpha =
        (1 - clamp(spark.age / config.sparkLife)) ** 2 *
        opacityAt(spark.x, spark.y) *
        0.8;
      ctx.strokeStyle = colors.orange;
      ctx.strokeRect(spark.x - 2, spark.y - 2, 4, 4);
    }
    waves = waves.filter((wave) => wave.age < config.waveLife);
    sparks = sparks.filter((spark) => spark.age < config.sparkLife);
    trails = trails.filter((trail) => trail.age < config.trailLife);
    ctx.globalAlpha = 1;
  }
  function tick(stamp: number) {
    frame = 0;
    if (destroyed) return;
    const fps =
      elapsed - lastInput > config.idleAfter
        ? config.idleFps
        : config.activeFps;
    if (!previous || stamp - previous >= 1000 / fps - 1) {
      const dt = previous ? Math.min((stamp - previous) / 1000, 0.05) : 0;
      previous = stamp;
      elapsed += dt;
      paint(dt);
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    if (destroyed) return;
    const mode: Mode = reduce.matches
      ? "reduced"
      : paused
        ? "paused"
        : document.hidden
          ? "hidden"
          : !visible
            ? "offscreen"
            : "running";
    if (mode !== currentMode) {
      currentMode = mode;
      canvas.dataset.motion = mode;
      onMode(mode);
    }
    if (mode !== "running") leave();
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    if (mode === "running") frame = requestAnimationFrame(tick);
    else if (mode === "reduced") {
      waves = [];
      sparks = [];
      trails = [];
      pointerWeight = 0;
      paint(0);
    }
  }
  function local(event: PointerEvent): Point {
    const box = host.getBoundingClientRect();
    return { x: event.clientX - box.left, y: event.clientY - box.top };
  }
  function move(event: PointerEvent) {
    if (down) {
      const point = local(event);
      if (Math.hypot(point.x - down.x, point.y - down.y) > 10) down = null;
    }
    if (event.pointerType === "touch" || currentMode !== "running") return;
    pointer = { ...local(event), inside: true };
    lastInput = elapsed;
    if (elapsed - lastTrail > 0.08) {
      lastTrail = elapsed;
      trails.push({ ...pointer, age: 0 });
      trails = trails.slice(-config.maxTrails);
    }
  }
  function leave() {
    pointer.inside = false;
    down = null;
  }
  function pointerDown(event: PointerEvent) {
    if (
      currentMode !== "running" ||
      event.button !== 0 ||
      !event.isPrimary ||
      (event.target instanceof Element && event.target.closest(controlSelector))
    )
      return;
    down = { ...local(event), id: event.pointerId, time: event.timeStamp };
  }
  function pointerUp(event: PointerEvent) {
    if (!down || down.id !== event.pointerId) return;
    const start = down;
    down = null;
    const point = local(event);
    if (
      currentMode !== "running" ||
      event.timeStamp - start.time > 550 ||
      Math.hypot(point.x - start.x, point.y - start.y) > 10 ||
      elapsed - lastBurst < 0.09 ||
      (event.target instanceof Element && event.target.closest(controlSelector))
    )
      return;
    lastBurst = elapsed;
    lastInput = elapsed;
    const variant =
      (burstIndex++ + Math.floor(point.x / Math.max(width / 3, 1))) % 3;
    waves.push({ ...point, age: 0, variant });
    waves = waves.slice(-config.maxWaves);
    const count = width < 800 ? 4 : 8;
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2 + variant * 0.4;
      sparks.push({
        ...point,
        age: 0,
        vx: Math.cos(angle) * 90,
        vy: Math.sin(angle) * 90,
      });
    }
    sparks = sparks.slice(-config.maxSparks);
  }
  const intersection = new IntersectionObserver(
    (entries) => {
      visible = entries.some((entry) => entry.isIntersecting);
      if (!visible) leave();
      sync();
    },
    { threshold: 0 },
  );
  const resizeObserver = new ResizeObserver(resize);
  const themeObserver = new MutationObserver(readTheme);
  intersection.observe(host);
  resizeObserver.observe(host);
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  reduce.addEventListener("change", sync);
  systemTheme.addEventListener("change", readTheme);
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("resize", resize, { passive: true });
  host.addEventListener("pointermove", move, { passive: true });
  host.addEventListener("pointerleave", leave, { passive: true });
  host.addEventListener("pointerdown", pointerDown, { passive: true });
  host.addEventListener("pointerup", pointerUp, { passive: true });
  host.addEventListener("pointercancel", leave, { passive: true });
  resize();
  readTheme();
  sync();
  return {
    setPaused(value: boolean) {
      paused = value;
      leave();
      sync();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      intersection.disconnect();
      resizeObserver.disconnect();
      themeObserver.disconnect();
      reduce.removeEventListener("change", sync);
      systemTheme.removeEventListener("change", readTheme);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("resize", resize);
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
      host.removeEventListener("pointerdown", pointerDown);
      host.removeEventListener("pointerup", pointerUp);
      host.removeEventListener("pointercancel", leave);
    },
  };
}
