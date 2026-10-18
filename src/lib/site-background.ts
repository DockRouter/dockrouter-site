export const BACKGROUND_CONFIG = {
  spacing: 290,
  maxColumns: 13,
  desktopRows: 5,
  mobileColumns: 3,
  mobileRows: 4,
  pointerRadius: 180,
  displacement: 26,
  parallax: 0.065,
  driftSpeed: 0.16,
  packetSpeed: 0.07,
  activeFps: 60,
  idleFps: 30,
  idleAfter: 4,
  waveRadius: 210,
  waveLife: 1.8,
  maxWaves: 5,
  maxSparks: 30,
  maxTrails: 8,
  sparkLife: 1.2,
  trailLife: 0.65,
} as const;

type Config = { [Key in keyof typeof BACKGROUND_CONFIG]: number };
type Mode = "running" | "paused" | "reduced" | "hidden" | "offscreen";
type Point = { x: number; y: number };
type Port = Point & {
  bx: number;
  by: number;
  depth: number;
  element: SVGGElement;
  visible: boolean;
};
type Route = {
  from: Port;
  to: Port;
  line: SVGPathElement;
  packet: SVGCircleElement;
  seed: number;
};
type Effect = Point & { age: number; element: SVGGElement };
type Wave = Effect & { variant: number };
type Spark = Effect & { vx: number; vy: number };

const namespace = "http://www.w3.org/2000/svg";
const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const smooth = (value: number) => value * value * (3 - 2 * value);
const interactive =
  "a,button,input,select,textarea,label,summary,[role=button],[role=dialog],dialog,.site-header,.hero-routing,pre,code,table,p,h1,h2,h3,h4,li,blockquote,[data-background-ignore]";

function svgElement<K extends keyof SVGElementTagNameMap>(
  tag: K,
  attributes: Record<string, string | number> = {},
) {
  const element = document.createElementNS(namespace, tag);
  for (const [key, value] of Object.entries(attributes))
    element.setAttribute(key, String(value));
  return element;
}
function show(element: SVGElement, visible: boolean) {
  element.style.display = visible ? "" : "none";
}
const translate = (element: SVGElement, x: number, y: number) =>
  element.setAttribute(
    "transform",
    `translate(${x.toFixed(2)} ${y.toFixed(2)})`,
  );

/** A viewport-sized SVG field; its DOM and frame data are owned outside React. */
export function createSiteBackground(
  svg: SVGSVGElement,
  scene: SVGGElement,
  onMode: (mode: Mode) => void,
  config: Config = BACKGROUND_CONFIG,
) {
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const network = svgElement("g", { class: "background-network" });
  const maskId = svg.querySelector("mask")?.id;
  if (maskId) network.setAttribute("mask", `url(#${maskId})`);
  const effects = svgElement("g", { class: "background-effects" });
  scene.append(network, effects);
  let width = 0;
  let height = 0;
  let ports: Port[] = [];
  let routes: Route[] = [];
  let elapsed = 0;
  let previous = 0;
  let frameBudget = 0;
  let sincePaint = 0;
  let lastInput = -10;
  let lastTrail = -10;
  let lastBurst = -10;
  let pointerWeight = 0;
  let activity = 0.35;
  let scroll = window.scrollY;
  let targetScroll = scroll;
  let frame = 0;
  let paused = false;
  let visible = false;
  let destroyed = false;
  let mode: Mode | undefined;
  let waveCursor = 0;
  let sparkCursor = 0;
  let trailCursor = 0;
  let pointer = { x: -1000, y: -1000, inside: false };
  let down: (Point & { id: number; time: number }) | null = null;

  const waves: Wave[] = Array.from({ length: config.maxWaves }, (_, i) => {
    const element = svgElement("g", {
      "data-wave": i,
      class: "background-wave",
    });
    element.append(
      svgElement("circle", { r: 1 }),
      svgElement("circle", { r: 1, class: "wave-inner" }),
    );
    show(element, false);
    effects.append(element);
    return { x: 0, y: 0, age: Infinity, variant: 0, element };
  });
  const sparks: Spark[] = Array.from({ length: config.maxSparks }, (_, i) => {
    const element = svgElement("g", {
      "data-spark": i,
      class: "background-spark",
    });
    element.append(
      svgElement("rect", { x: -2, y: -2, width: 4, height: 4, rx: 0.8 }),
    );
    show(element, false);
    effects.append(element);
    return { x: 0, y: 0, vx: 0, vy: 0, age: Infinity, element };
  });
  const trails: Effect[] = Array.from({ length: config.maxTrails }, (_, i) => {
    const element = svgElement("g", {
      "data-trail": i,
      class: "background-trail",
    });
    element.append(svgElement("circle", { r: 1 }));
    show(element, false);
    effects.append(element);
    return { x: 0, y: 0, age: Infinity, element };
  });
  function clearEffects() {
    for (const effect of [...waves, ...sparks, ...trails]) {
      effect.age = Infinity;
      show(effect.element, false);
    }
  }
  function edgeFade(x: number, y: number) {
    return smooth(clamp(Math.min(x, width - x, y, height - y) / 65));
  }
  function routePoint(route: Route, t: number) {
    const { from: a, to: b } = route;
    const middle = (a.x + b.x) / 2;
    const u = 1 - t;
    return {
      x: u ** 3 * a.x + 3 * u * t * middle + t ** 3 * b.x,
      y:
        u ** 3 * a.y +
        3 * u ** 2 * t * a.y +
        3 * u * t ** 2 * b.y +
        t ** 3 * b.y,
    };
  }
  function resize() {
    if (destroyed) return;
    const bounds = svg.getBoundingClientRect();
    if (
      !bounds.width ||
      !bounds.height ||
      (bounds.width === width && bounds.height === height)
    )
      return;
    width = bounds.width;
    height = bounds.height;
    svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
    const columns =
      width < 800
        ? config.mobileColumns
        : Math.min(
            config.maxColumns,
            Math.max(5, Math.ceil(width / config.spacing)),
          );
    const rows = width < 800 ? config.mobileRows : config.desktopRows;
    const geometry = svgElement("g");
    ports = [];
    routes = [];
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const seed = row * columns + column;
        const x =
          ((column + 0.3 + Math.sin(row * 2.1) * 0.12) / columns) * width;
        const y = ((row + 0.45) / rows) * height + Math.sin(column * 1.9) * 35;
        const element = svgElement("g", {
          "data-object": seed,
          class: `background-object object-${seed % 4}`,
        });
        if (seed % 4 === 0) {
          element.append(
            svgElement("circle", { r: 8 }),
            svgElement("path", { d: "M-14 0h5m18 0h5M0-14v5m0 18v5" }),
          );
        } else if (seed % 4 === 1) {
          element.append(
            svgElement("rect", { x: -5, y: -5, width: 10, height: 10, rx: 2 }),
            svgElement("path", { d: "M-10-10h5m10 0h5v5M10 5v5H5M-5 10h-5V5" }),
          );
        } else if (seed % 4 === 2) {
          element.append(
            svgElement("path", {
              d: "M0-11 10-5v10L0 11-10 5V-5ZM-10-5 0 1 10-5M0 1v10",
            }),
          );
        } else {
          element.append(
            svgElement("path", {
              d: "M-12 0H0m0 0 9-9m-9 9 9 9M-12 0a2 2 0 1 1-4 0 2 2 0 1 1 4 0M13-11a2 2 0 1 1-4 0 2 2 0 1 1 4 0M13 11a2 2 0 1 1-4 0 2 2 0 1 1 4 0",
            }),
          );
        }
        geometry.append(element);
        ports.push({
          bx: x,
          by: y,
          x,
          y,
          depth: 0.35 + (seed % 4) * 0.2,
          element,
          visible: true,
        });
      }
    }
    const lines = svgElement("g", { class: "background-routes" });
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns - 1; column++) {
        const seed = row * columns + column;
        const line = svgElement("path", { class: "background-route" });
        const packet = svgElement("circle", {
          r: 1.8,
          class: "background-packet",
        });
        lines.append(line, packet);
        routes.push({
          from: ports[seed],
          to: ports[seed + 1],
          line,
          packet,
          seed,
        });
        if (row < rows - 1 && (row + column) % 3 === 0) {
          const branch = svgElement("path", {
            class: "background-route route-branch",
          });
          const branchPacket = svgElement("circle", {
            r: 1.5,
            class: "background-packet",
          });
          lines.append(branch, branchPacket);
          routes.push({
            from: ports[seed],
            to: ports[seed + columns + 1],
            line: branch,
            packet: branchPacket,
            seed: seed + 0.5,
          });
        }
      }
    }
    network.replaceChildren(lines, geometry);
    clearEffects();
    render(0);
  }
  function render(dt: number) {
    const still = reduced.matches;
    activity +=
      ((elapsed - lastInput > config.idleAfter ? 0.35 : 1) - activity) *
      (1 - Math.exp(-dt * 2));
    pointerWeight +=
      ((pointer.inside && !still ? 1 : 0) - pointerWeight) *
      (1 - Math.exp(-dt * 5));
    scroll += (targetScroll - scroll) * (1 - Math.exp(-dt * 8));
    scene.setAttribute(
      "opacity",
      String(still ? 1 : smooth(clamp(elapsed / 1.2))),
    );
    for (let i = 0; i < ports.length; i++) {
      const port = ports[i];
      const baseY = still
        ? port.by
        : ((((port.by - scroll * config.parallax * port.depth + 80) %
            (height + 160)) +
            height +
            160) %
            (height + 160)) -
          80;
      const dx = port.bx - pointer.x;
      const dy = baseY - pointer.y;
      const distance = Math.hypot(dx, dy);
      const force =
        (1 - clamp(distance / config.pointerRadius)) ** 2 * pointerWeight;
      let impulseX = 0;
      let impulseY = 0;
      for (const wave of waves) {
        if (wave.age >= config.waveLife) continue;
        const radius =
          config.waveRadius * (1 - (1 - wave.age / config.waveLife) ** 3);
        const dist = Math.hypot(port.bx - wave.x, baseY - wave.y);
        const power =
          Math.exp(-(((dist - radius) / 32) ** 2)) *
          (1 - wave.age / config.waveLife) *
          14;
        impulseX += ((port.bx - wave.x) / Math.max(dist, 1)) * power;
        impulseY += ((baseY - wave.y) / Math.max(dist, 1)) * power;
      }
      const drift = still ? 0 : activity * port.depth;
      const targetX =
        port.bx +
        Math.sin(elapsed * config.driftSpeed + i) * 7 * drift +
        (dx / Math.max(distance, 1)) * force * config.displacement +
        impulseX;
      const targetY =
        baseY +
        Math.cos(elapsed * config.driftSpeed * 0.8 + i) * 11 * drift +
        (dy / Math.max(distance, 1)) * force * config.displacement +
        impulseY;
      const easing =
        !dt || still || Math.abs(port.y - targetY) > height / 2
          ? 1
          : 1 - Math.exp(-dt * 6);
      port.x += (targetX - port.x) * easing;
      port.y += (targetY - port.y) * easing;
      port.visible = port.y > -25 && port.y < height + 25;
      show(port.element, port.visible);
      if (!port.visible) continue;
      translate(port.element, port.x, port.y);
      port.element.setAttribute(
        "opacity",
        String(edgeFade(port.x, port.y) * (0.5 + port.depth * 0.3)),
      );
    }
    for (const route of routes) {
      const visible =
        route.from.visible &&
        route.to.visible &&
        Math.abs(route.from.y - route.to.y) < height * 0.6;
      show(route.line, visible);
      show(route.packet, visible && !still);
      if (!visible) continue;
      const a = route.from;
      const b = route.to;
      const middle = (a.x + b.x) / 2;
      route.line.setAttribute(
        "d",
        `M${a.x.toFixed(2)} ${a.y.toFixed(2)}C${middle.toFixed(2)} ${a.y.toFixed(2)} ${middle.toFixed(2)} ${b.y.toFixed(2)} ${b.x.toFixed(2)} ${b.y.toFixed(2)}`,
      );
      const alpha = Math.min(edgeFade(a.x, a.y), edgeFade(b.x, b.y));
      route.line.setAttribute("opacity", String(alpha));
      if (still) continue;
      const t =
        (elapsed * config.packetSpeed * (0.65 + (route.seed % 3) * 0.25) +
          route.seed * 0.317) %
        1;
      const point = routePoint(route, t);
      translate(route.packet, point.x, point.y);
      route.packet.setAttribute(
        "opacity",
        String(alpha * Math.sin(t * Math.PI) * (0.4 + activity * 0.6)),
      );
    }
    for (const wave of waves) {
      wave.age += dt;
      show(wave.element, wave.age < config.waveLife);
      if (wave.age >= config.waveLife) continue;
      const life = clamp(wave.age / config.waveLife);
      const radius = Math.max(1, config.waveRadius * (1 - (1 - life) ** 3));
      translate(wave.element, wave.x, wave.y);
      wave.element.setAttribute("opacity", String((1 - life) ** 2));
      wave.element.children[0].setAttribute("r", String(radius));
      wave.element.children[1].setAttribute("r", String(radius * 0.72));
    }
    for (const spark of sparks) {
      spark.age += dt;
      show(spark.element, spark.age < config.sparkLife);
      if (spark.age >= config.sparkLife) continue;
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx *= Math.exp(-dt * 3);
      spark.vy *= Math.exp(-dt * 3);
      translate(spark.element, spark.x, spark.y);
      spark.element.setAttribute(
        "opacity",
        String(
          (1 - spark.age / config.sparkLife) ** 2 * edgeFade(spark.x, spark.y),
        ),
      );
    }
    for (const trail of trails) {
      trail.age += dt;
      show(trail.element, trail.age < config.trailLife);
      if (trail.age >= config.trailLife) continue;
      const life = trail.age / config.trailLife;
      translate(trail.element, trail.x, trail.y);
      trail.element.children[0].setAttribute("r", String(4 + life * 18));
      trail.element.setAttribute(
        "opacity",
        String((1 - life) ** 2 * edgeFade(trail.x, trail.y) * 0.45),
      );
    }
  }
  function tick(stamp: number) {
    frame = 0;
    if (destroyed) return;
    const fps =
      elapsed - lastInput > config.idleAfter
        ? config.idleFps
        : config.activeFps;
    const dt = previous ? Math.min((stamp - previous) / 1000, 0.05) : 0;
    previous = stamp;
    frameBudget += dt;
    sincePaint += dt;
    const interval = 1 / fps;
    // Carry the remainder instead of rounding to a multiple of the RAF cadence.
    if (frameBudget + 1e-9 >= interval) {
      elapsed += sincePaint;
      render(sincePaint);
      sincePaint = 0;
      frameBudget = Math.max(0, frameBudget - interval);
      if (frameBudget >= interval) frameBudget %= interval;
    }
    frame = requestAnimationFrame(tick);
  }
  function leave() {
    pointer.inside = false;
    down = null;
  }
  function sync() {
    if (destroyed) return;
    const next: Mode = reduced.matches
      ? "reduced"
      : paused
        ? "paused"
        : document.hidden
          ? "hidden"
          : !visible
            ? "offscreen"
            : "running";
    if (mode !== next) {
      mode = next;
      svg.dataset.motion = mode;
      onMode(mode);
    }
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    frameBudget = 0;
    sincePaint = 0;
    if (mode === "running") frame = requestAnimationFrame(tick);
    else {
      leave();
      if (mode === "reduced") {
        clearEffects();
        pointerWeight = 0;
        render(0);
      }
    }
  }
  function blocked(event: PointerEvent) {
    return (
      event.target instanceof Element &&
      Boolean(event.target.closest(interactive))
    );
  }
  function move(event: PointerEvent) {
    if (down && Math.hypot(event.clientX - down.x, event.clientY - down.y) > 10)
      down = null;
    if (event.pointerType === "touch" || mode !== "running") return;
    pointer = { x: event.clientX, y: event.clientY, inside: true };
    lastInput = elapsed;
    if (elapsed - lastTrail > 0.09 && !blocked(event)) {
      lastTrail = elapsed;
      const trail = trails[trailCursor++ % trails.length];
      Object.assign(trail, { x: pointer.x, y: pointer.y, age: 0 });
    }
  }
  function pointerDown(event: PointerEvent) {
    if (
      mode !== "running" ||
      event.button !== 0 ||
      !event.isPrimary ||
      blocked(event)
    )
      return;
    down = {
      x: event.clientX,
      y: event.clientY,
      id: event.pointerId,
      time: event.timeStamp,
    };
  }
  function pointerUp(event: PointerEvent) {
    if (!down || down.id !== event.pointerId) return;
    const start = down;
    down = null;
    if (
      mode !== "running" ||
      blocked(event) ||
      event.timeStamp - start.time > 550 ||
      Math.hypot(event.clientX - start.x, event.clientY - start.y) > 10 ||
      elapsed - lastBurst < 0.09 ||
      window.getSelection()?.isCollapsed === false
    )
      return;
    lastBurst = elapsed;
    lastInput = elapsed;
    const wave = waves[waveCursor++ % waves.length];
    const variant =
      (waveCursor + Math.floor(event.clientX / Math.max(width / 3, 1))) % 3;
    Object.assign(wave, {
      x: event.clientX,
      y: event.clientY,
      age: 0,
      variant,
    });
    wave.element.setAttribute("data-variant", String(variant));
    const count = width < 800 ? 4 : 6;
    for (let i = 0; i < count; i++) {
      const spark = sparks[sparkCursor++ % sparks.length];
      const angle = (i / count) * Math.PI * 2 + variant * 0.4;
      Object.assign(spark, {
        x: event.clientX,
        y: event.clientY,
        age: 0,
        vx: Math.cos(angle) * 85,
        vy: Math.sin(angle) * 85,
      });
    }
  }
  function onScroll() {
    targetScroll = window.scrollY;
  }
  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    sync();
  });
  const size = new ResizeObserver(resize);
  intersection.observe(svg);
  size.observe(svg);
  document.addEventListener("pointermove", move, { passive: true });
  document.addEventListener("pointerdown", pointerDown, { passive: true });
  document.addEventListener("pointerup", pointerUp, { passive: true });
  document.addEventListener("pointercancel", leave, { passive: true });
  document.documentElement.addEventListener("pointerleave", leave, {
    passive: true,
  });
  document.addEventListener("visibilitychange", sync);
  window.addEventListener("blur", leave);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", resize, { passive: true });
  reduced.addEventListener("change", sync);
  resize();
  sync();
  return {
    setPaused(value: boolean) {
      paused = value;
      sync();
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      intersection.disconnect();
      size.disconnect();
      reduced.removeEventListener("change", sync);
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("pointerup", pointerUp);
      document.removeEventListener("pointercancel", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("blur", leave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      network.remove();
      effects.remove();
    },
  };
}
