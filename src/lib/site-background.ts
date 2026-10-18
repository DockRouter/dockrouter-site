export const BACKGROUND_CONFIG = {
  spacing: 290,
  maxColumns: 13,
  desktopRows: 5,
  mobileColumns: 3,
  mobileRows: 4,
  pointerRadius: 270,
  displacement: 62,
  orbitSpeed: 0.95,
  chainSpeed: 950,
  chainLife: 0.65,
  maxRelays: 8,
  glowRadius: 112,
  maxResponders: 8,
  waveImpulse: 38,
  sparkSpeed: 145,
  parallax: 0.065,
  driftSpeed: 0.16,
  packetSpeed: 0.07,
  activeFps: 60,
  idleFps: 30,
  idleAfter: 4,
  waveRadius: 300,
  waveLife: 2,
  maxWaves: 5,
  maxSparks: 30,
  maxTrails: 8,
  sparkLife: 1.2,
  trailLife: 0.8,
} as const;

type Config = { [Key in keyof typeof BACKGROUND_CONFIG]: number };
type Mode = "running" | "reduced" | "hidden" | "offscreen";
type Point = { x: number; y: number };
type Port = Point & {
  bx: number;
  by: number;
  depth: number;
  element: SVGGElement;
  visible: boolean;
  orbit: number;
  echo: number;
  echoFrom: Point | null;
  neighbors: Port[];
};
type Route = {
  from: Port;
  to: Port;
  line: SVGPathElement;
  packet: SVGCircleElement;
  seed: number;
};
type Effect = Point & { age: number; element: SVGGElement };
type Relay = { delay: number; gain: number; from: Point; hops: number };
type Wave = Effect & { variant: number; relays: Map<Port, Relay> };
type Spark = Effect & { vx: number; vy: number };
type Trail = Effect & { fromX: number; fromY: number };

const namespace = "http://www.w3.org/2000/svg";
const clamp = (value: number, min = 0, max = 1) =>
  Math.max(min, Math.min(max, value));
const smooth = (value: number) => value * value * (3 - 2 * value);
const interactive =
  "a,button,input,select,textarea,label,summary,[role=button],[role=tab],[role=radio],[role=dialog],dialog,[contenteditable=true],[data-background-ignore]";

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
  interactionSvg: SVGSVGElement,
  interactionScene: SVGGElement,
  preference: "on" | "off" | "reduced",
  ambientEnabled: boolean,
  config: Config = BACKGROUND_CONFIG,
) {
  const reduced = !ambientEnabled;
  let mousePreference = preference;
  let enabled = preference === "on";
  let pointerListening = false;
  const network = svgElement("g", { class: "background-network" });
  const maskId = svg.querySelector("mask")?.id;
  if (maskId) network.setAttribute("mask", `url(#${maskId})`);
  const effects = svgElement("g", { class: "background-effects" });
  scene.append(network);
  interactionScene.append(effects);
  interactionScene.setAttribute("opacity", "0");
  const pointerField = svgElement("g", {
    class: "pointer-field",
    "data-pointer-field": "",
    opacity: 0,
  });
  const glowId = interactionSvg.querySelector("radialGradient")?.id;
  pointerField.append(
    svgElement("circle", {
      r: config.glowRadius,
      fill: `url(#${glowId})`,
      class: "pointer-glow",
    }),
    svgElement("circle", {
      r: 44,
      class: "pointer-orbit",
      "stroke-dasharray": "14 64 25 174",
    }),
    svgElement("circle", {
      r: 19,
      class: "pointer-orbit pointer-inner",
      "stroke-dasharray": "6 54",
    }),
  );
  interactionScene.prepend(pointerField);
  const responders = Array.from({ length: config.maxResponders }, (_, i) => {
    const element = svgElement("g", {
      "data-response": i,
      class: "pointer-response",
    });
    const link = svgElement("path", { class: "pointer-link" });
    element.append(
      link,
      svgElement("circle", { r: 7 }),
      svgElement("path", { d: "M-12 0h4m16 0h4M0-12v4m0 16v4" }),
    );
    show(element, false);
    interactionScene.append(element);
    return { element, link };
  });
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
    return {
      x: 0,
      y: 0,
      age: Infinity,
      variant: 0,
      relays: new Map(),
      element,
    };
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
  const trails: Trail[] = Array.from({ length: config.maxTrails }, (_, i) => {
    const element = svgElement("g", {
      "data-trail": i,
      class: "background-trail",
    });
    element.append(
      svgElement("circle", { r: 1 }),
      svgElement("path", { class: "trail-light" }),
      svgElement("path", { class: "trail-core" }),
    );
    show(element, false);
    effects.append(element);
    return { x: 0, y: 0, fromX: 0, fromY: 0, age: Infinity, element };
  });
  function clearEffects() {
    show(pointerField, false);
    for (const response of responders) show(response.element, false);
    for (const effect of [...waves, ...sparks, ...trails]) {
      effect.age = Infinity;
      show(effect.element, false);
    }
    for (const wave of waves) wave.relays.clear();
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
    interactionSvg.setAttribute("viewBox", `0 0 ${width} ${height}`);
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
          orbit: 0,
          echo: 0,
          echoFrom: null,
          neighbors: [],
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
    for (const route of routes) {
      route.from.neighbors.push(route.to);
      route.to.neighbors.push(route.from);
    }
    network.replaceChildren(lines, geometry);
    clearEffects();
    render(0);
  }
  function render(dt: number) {
    const still = !ambientEnabled;
    const pointerRadius = config.pointerRadius * (width < 800 ? 0.65 : 1);
    const waveRadius = config.waveRadius * (width < 800 ? 0.6 : 1);
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
    if (enabled)
      interactionScene.setAttribute(
        "opacity",
        String(still ? 0 : smooth(clamp(elapsed / 0.7))),
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
      const force = (1 - clamp(distance / pointerRadius)) ** 2 * pointerWeight;
      const influence =
        smooth(1 - clamp((distance - 55) / (pointerRadius - 55))) *
        pointerWeight;
      // Each depth follows a slightly different current; the anchor springs back
      // as the pointer leaves rather than snapping to a new orbit center.
      port.orbit +=
        dt * config.orbitSpeed * influence * (0.65 + port.depth * 0.5);
      const orbitX = dx * Math.cos(port.orbit) - dy * Math.sin(port.orbit);
      const orbitY = dx * Math.sin(port.orbit) + dy * Math.cos(port.orbit);
      let impulseX = 0;
      let impulseY = 0;
      port.echo = 0;
      port.echoFrom = null;
      for (const wave of waves) {
        if (wave.age >= config.waveLife) continue;
        const radius = waveRadius * (1 - (1 - wave.age / config.waveLife) ** 3);
        const dist = Math.hypot(port.bx - wave.x, baseY - wave.y);
        const power =
          Math.exp(-(((dist - radius) / 32) ** 2)) *
          (1 - wave.age / config.waveLife) *
          config.waveImpulse;
        impulseX += ((port.bx - wave.x) / Math.max(dist, 1)) * power;
        impulseY += ((baseY - wave.y) / Math.max(dist, 1)) * power;
        const relay = wave.relays.get(port);
        if (!relay) continue;
        const age = wave.age - relay.delay;
        if (age < 0 || age >= config.chainLife) continue;
        const pulse =
          Math.sin((age / config.chainLife) * Math.PI) ** 2 * relay.gain;
        if (pulse > port.echo) {
          port.echo = pulse;
          port.echoFrom = relay.from;
        }
        const rx = port.bx - relay.from.x;
        const ry = baseY - relay.from.y;
        const length = Math.max(1, Math.hypot(rx, ry));
        impulseX += ((rx - ry * 0.55) / length) * pulse * config.waveImpulse;
        impulseY += ((ry + rx * 0.55) / length) * pulse * config.waveImpulse;
      }
      const drift = still ? 0 : activity * port.depth;
      const targetX =
        port.bx +
        Math.sin(elapsed * config.driftSpeed + i) * 7 * drift +
        (orbitX - dx) * influence +
        (dx / Math.max(distance, 1)) * force * config.displacement * 0.45 +
        impulseX;
      const targetY =
        baseY +
        Math.cos(elapsed * config.driftSpeed * 0.8 + i) * 11 * drift +
        (orbitY - dy) * influence +
        (dy / Math.max(distance, 1)) * force * config.displacement * 0.45 +
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
    if (enabled) {
      show(pointerField, !still && pointerWeight > 0.015);
      if (!still && pointerWeight > 0.015) {
        translate(pointerField, pointer.x, pointer.y);
        pointerField.setAttribute(
          "opacity",
          String(pointerWeight * (0.6 + activity * 0.4)),
        );
        pointerField.children[0].setAttribute(
          "r",
          String(config.glowRadius * (width < 800 ? 0.65 : 1)),
        );
        pointerField.children[1].setAttribute(
          "transform",
          `rotate(${elapsed * 24})`,
        );
        pointerField.children[2].setAttribute(
          "transform",
          `rotate(${-elapsed * 38})`,
        );
      }
      const responses = ports
        .map((port, index) => {
          const distance = Math.hypot(port.x - pointer.x, port.y - pointer.y);
          let strength =
            pointerWeight * (1 - clamp(distance / pointerRadius)) ** 1.4 +
            port.echo;
          for (const wave of waves) {
            if (wave.age >= config.waveLife) continue;
            const radius =
              waveRadius * (1 - (1 - wave.age / config.waveLife) ** 3);
            const waveDistance = Math.hypot(port.x - wave.x, port.y - wave.y);
            strength +=
              Math.exp(-(((waveDistance - radius) / 48) ** 2)) *
              (1 - wave.age / config.waveLife);
          }
          return {
            port,
            index,
            strength: clamp(strength) * edgeFade(port.x, port.y),
          };
        })
        .sort((a, b) => b.strength - a.strength);
      for (let i = 0; i < responders.length; i++) {
        const response = responders[i];
        const source = responses[i];
        const visible =
          !still && source && source.strength > 0.015 && source.port.visible;
        show(response.element, Boolean(visible));
        if (!visible) continue;
        const { port, strength } = source;
        translate(response.element, port.x, port.y);
        response.element.setAttribute("data-source", String(source.index));
        response.element.setAttribute("opacity", String(strength * 0.65));
        response.element.children[1].setAttribute(
          "r",
          String(7 + port.echo * 14),
        );
        const origin = port.echoFrom ?? pointer;
        const dx = origin.x - port.x;
        const dy = origin.y - port.y;
        const length = Math.max(1, Math.hypot(dx, dy));
        const endX = dx * Math.max(0, 1 - 24 / length);
        const endY = dy * Math.max(0, 1 - 24 / length);
        response.link.setAttribute(
          "d",
          `M0 0Q${(dx * 0.5 - dy * 0.2).toFixed(2)} ${(dy * 0.5 + dx * 0.2).toFixed(2)} ${endX.toFixed(2)} ${endY.toFixed(2)}`,
        );
        response.link.setAttribute(
          "opacity",
          String(Math.max(pointerWeight, port.echo) * 0.4),
        );
      }
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
    if (!enabled) return;
    for (const wave of waves) {
      wave.age += dt;
      show(wave.element, wave.age < config.waveLife);
      if (wave.age >= config.waveLife) continue;
      const life = clamp(wave.age / config.waveLife);
      const radius = Math.max(1, waveRadius * (1 - (1 - life) ** 3));
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
      trail.element.children[0].setAttribute("r", String(3 + life * 13));
      const dx = trail.fromX - trail.x;
      const dy = trail.fromY - trail.y;
      const path = `M${dx.toFixed(2)} ${dy.toFixed(2)}Q${(dx * 0.4).toFixed(2)} ${(dy * 0.6).toFixed(2)} 0 0`;
      trail.element.children[1].setAttribute("d", path);
      trail.element.children[2].setAttribute("d", path);
      trail.element.setAttribute(
        "opacity",
        String((1 - life) ** 2 * edgeFade(trail.x, trail.y) * 0.65),
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
    const next: Mode = reduced
      ? "reduced"
      : document.hidden
        ? "hidden"
        : !visible
          ? "offscreen"
          : "running";
    if (mode !== next) {
      mode = next;
      svg.dataset.motion = mode;
      interactionSvg.dataset.motion = enabled
        ? mode
        : mousePreference === "reduced"
          ? "reduced"
          : "paused";
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
    const fromX = pointer.inside ? pointer.x : event.clientX;
    const fromY = pointer.inside ? pointer.y : event.clientY;
    pointer = { x: event.clientX, y: event.clientY, inside: true };
    lastInput = elapsed;
    if (elapsed - lastTrail > 0.045) {
      lastTrail = elapsed;
      const trail = trails[trailCursor++ % trails.length];
      const distance = Math.max(
        1,
        Math.hypot(fromX - pointer.x, fromY - pointer.y),
      );
      const scale = Math.min(1, 90 / distance);
      Object.assign(trail, {
        x: pointer.x,
        y: pointer.y,
        fromX: pointer.x + (fromX - pointer.x) * scale,
        fromY: pointer.y + (fromY - pointer.y) * scale,
        age: 0,
      });
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
  function relayWave(wave: Wave) {
    wave.relays.clear();
    const nearest = ports.reduce<Port | null>((best, port) => {
      if (!port.visible) return best;
      return !best ||
        Math.hypot(port.x - wave.x, port.y - wave.y) <
          Math.hypot(best.x - wave.x, best.y - wave.y)
        ? port
        : best;
    }, null);
    const reach = config.waveRadius * (width < 800 ? 0.6 : 1);
    if (!nearest || Math.hypot(nearest.x - wave.x, nearest.y - wave.y) > reach)
      return;
    // A bounded shortest-arrival walk through the existing route graph. Relays
    // cannot spawn more waves or allocate SVG nodes, even during rapid clicks.
    const queue = [
      {
        port: nearest,
        delay: 0.08,
        gain: 1,
        from: { x: wave.x, y: wave.y },
        hops: 0,
      },
    ];
    const limit = width < 800 ? 4 : config.maxRelays;
    while (queue.length && wave.relays.size < limit) {
      queue.sort((a, b) => a.delay - b.delay);
      const next = queue.shift();
      if (!next || wave.relays.has(next.port)) continue;
      wave.relays.set(next.port, next);
      if (next.hops >= 3) continue;
      for (const neighbor of next.port.neighbors) {
        const distance = Math.hypot(
          neighbor.x - next.port.x,
          neighbor.y - next.port.y,
        );
        const delay = next.delay + 0.12 + distance / config.chainSpeed;
        if (
          !neighbor.visible ||
          wave.relays.has(neighbor) ||
          delay > 1.25 ||
          Math.hypot(neighbor.x - wave.x, neighbor.y - wave.y) > reach * 2.2
        )
          continue;
        queue.push({
          port: neighbor,
          delay,
          gain: next.gain * 0.7,
          from: next.port,
          hops: next.hops + 1,
        });
      }
    }
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
    relayWave(wave);
    const count = width < 800 ? 4 : 8;
    for (let i = 0; i < count; i++) {
      const spark = sparks[sparkCursor++ % sparks.length];
      const angle = (i / count) * Math.PI * 2 + variant * 0.4;
      Object.assign(spark, {
        x: event.clientX,
        y: event.clientY,
        age: 0,
        vx: Math.cos(angle) * config.sparkSpeed,
        vy: Math.sin(angle) * config.sparkSpeed,
      });
    }
  }
  function onScroll() {
    targetScroll = window.scrollY;
  }
  function listenToPointer(active: boolean) {
    if (pointerListening === active) return;
    pointerListening = active;
    if (active) {
      document.addEventListener("pointermove", move, { passive: true });
      document.addEventListener("pointerdown", pointerDown, { passive: true });
      document.addEventListener("pointerup", pointerUp, { passive: true });
      document.addEventListener("pointercancel", leave, { passive: true });
      document.documentElement.addEventListener("pointerleave", leave, {
        passive: true,
      });
      window.addEventListener("blur", leave);
    } else {
      document.removeEventListener("pointermove", move);
      document.removeEventListener("pointerdown", pointerDown);
      document.removeEventListener("pointerup", pointerUp);
      document.removeEventListener("pointercancel", leave);
      document.documentElement.removeEventListener("pointerleave", leave);
      window.removeEventListener("blur", leave);
    }
  }
  const intersection = new IntersectionObserver((entries) => {
    visible = entries.some((entry) => entry.isIntersecting);
    sync();
  });
  const size = new ResizeObserver(resize);
  size.observe(svg);
  listenToPointer(enabled);
  if (ambientEnabled) {
    intersection.observe(svg);
    document.addEventListener("visibilitychange", sync);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", resize, { passive: true });
  }
  resize();
  sync();
  return {
    setInteractionPreference(next: "on" | "off" | "reduced") {
      if (destroyed) return;
      mousePreference = next;
      enabled = next === "on";
      listenToPointer(enabled);
      leave();
      clearEffects();
      pointerWeight = 0;
      lastInput = -10;
      lastTrail = -10;
      lastBurst = -10;
      interactionScene.setAttribute("opacity", "0");
      interactionSvg.dataset.motion = enabled
        ? (mode ?? "offscreen")
        : next === "reduced"
          ? "reduced"
          : "paused";
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(frame);
      intersection.disconnect();
      size.disconnect();
      listenToPointer(false);
      document.removeEventListener("visibilitychange", sync);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", resize);
      network.remove();
      effects.remove();
      pointerField.remove();
      for (const response of responders) response.element.remove();
    },
  };
}
