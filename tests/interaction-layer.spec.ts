import { mkdir } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";

async function setup(page: Page) {
  await mkdir(".qa/interaction", { recursive: true });
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  // Pause on the blank page before loading the app. A one-second target can
  // already be in the past if the host stalls between these two commands.
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.goto("/");
  await expect(page.locator(".site-background > svg")).toHaveAttribute(
    "data-motion",
    "running",
  );
  await page.clock.runFor(1600);
}

test("nearby shapes orbit a stationary pointer smoothly while distant shapes stay calm", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page);
  const positions = () =>
    page.locator("[data-object]").evaluateAll((nodes) =>
      nodes.map((node) => {
        const m = (node as SVGGElement).transform.baseVal.consolidate()?.matrix;
        return { x: m?.e ?? 0, y: m?.f ?? 0 };
      }),
    );
  const before = await positions();
  const index = 10;
  const center = { x: before[index].x + 65, y: before[index].y + 15 };
  await page.mouse.move(center.x, center.y);
  await page.clock.runFor(400);
  const first = (await positions())[index];
  let previous = first;
  for (let i = 0; i < 12; i++) {
    await page.clock.runFor(100);
    const current = (await positions())[index];
    expect(
      Math.hypot(current.x - previous.x, current.y - previous.y),
    ).toBeLessThan(14);
    previous = current;
  }
  const start = Math.atan2(first.y - center.y, first.x - center.x);
  const end = Math.atan2(previous.y - center.y, previous.x - center.x);
  const sweep = Math.atan2(Math.sin(end - start), Math.cos(end - start));
  expect(sweep).toBeGreaterThan(0.35);
  const after = await positions();
  expect(
    Math.hypot(after[24].x - before[24].x, after[24].y - before[24].y),
  ).toBeLessThan(3);
  await page.screenshot({ path: ".qa/interaction/organic-orbit.png" });
});

test("a click relays a fading pulse between neighboring shapes without growing the SVG", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page);
  const total = await page
    .locator(".site-background svg *, .site-interaction-layer svg *")
    .count();
  const center = await page
    .locator('[data-object="10"]')
    .evaluate((el: SVGGElement) => {
      const m = el.transform.baseVal.consolidate()?.matrix;
      return { x: m?.e ?? 0, y: m?.f ?? 0 };
    });
  await page.mouse.click(center.x, center.y);
  await page.mouse.move(1439, 899);
  const peaks = new Map<number, { radius: number; time: number }>();
  for (let time = 100; time <= 2000; time += 100) {
    await page.clock.runFor(100);
    const pulses = await page
      .locator('[data-response]:not([style*="display: none"])')
      .evaluateAll((nodes) =>
        nodes.map((el) => ({
          source: Number(el.getAttribute("data-source")),
          radius: Number(el.querySelector("circle")?.getAttribute("r")),
        })),
      );
    for (const pulse of pulses) {
      if (pulse.radius > (peaks.get(pulse.source)?.radius ?? 8))
        peaks.set(pulse.source, { radius: pulse.radius, time });
    }
    if (time === 800)
      await page.screenshot({ path: ".qa/interaction/chain-reaction.png" });
  }
  const first = peaks.get(10);
  expect(first?.radius).toBeGreaterThan(15);
  const followers = [...peaks].filter(([source]) => source !== 10);
  expect(followers.length).toBeGreaterThanOrEqual(2);
  expect(
    followers.some(([, pulse]) => pulse.time > (first?.time ?? 0) + 200),
  ).toBe(true);
  expect(
    followers.every(([, pulse]) => pulse.radius < (first?.radius ?? 0)),
  ).toBe(true);
  await page.clock.runFor(1000);
  await expect(
    page
      .locator('[data-response] circle[r]:not([r="7"])')
      .filter({ visible: true }),
  ).toHaveCount(0);
  expect(
    await page
      .locator(".site-background svg *, .site-interaction-layer svg *")
      .count(),
  ).toBe(total);
});

for (const theme of ["light", "dark"]) {
  test(`pointer light trails remain visible over headings and opaque routing cards in ${theme}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.addInitScript(
      (value) => localStorage.setItem("dockrouter-theme", value),
      theme,
    );
    await setup(page);
    const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
    if (!heading) throw new Error("Heading missing");
    await page.mouse.move(heading.x + 40, heading.y + 25);
    await page.clock.runFor(180);
    await expect(
      page.locator('[data-trail]:not([style*="display: none"])'),
    ).not.toHaveCount(0);
    const layer = page.locator(".site-interaction-layer");
    await expect(layer).toHaveCount(1);
    await expect(layer).toHaveCSS("pointer-events", "none");
    await expect(layer.locator("svg")).toHaveCSS("mask-image", "none");
    expect(
      await layer.evaluate((el) => el.parentElement === document.body),
    ).toBe(true);
    expect(
      await layer.evaluate((el) => Number(getComputedStyle(el).zIndex)),
    ).toBeGreaterThan(40);
    await expect(
      page.locator(".site-interaction-layer [data-pointer-field]"),
    ).not.toHaveCSS("display", "none");
    const card = await page.locator(".hero-routing").boundingBox();
    if (!card) throw new Error("Card missing");
    await page.mouse.move(card.x + card.width * 0.45, card.y + 28);
    await page.clock.runFor(160);
    await expect(
      layer.locator('[data-trail]:not([style*="display: none"])'),
    ).not.toHaveCount(0);
    await mkdir(".qa/interaction", { recursive: true });
    await page.screenshot({ path: `.qa/interaction/over-card-${theme}.png` });
  });
}

test("foreground waves stay in viewport coordinates while scrolling and text remains selectable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page);
  await page.locator("#features").scrollIntoViewIfNeeded();
  const card = page.locator(".cap-card.cap-tls");
  await card.evaluate((el) =>
    el.scrollIntoView({ block: "center", behavior: "instant" }),
  );
  await page.clock.runFor(1000);
  const heading = card.getByRole("heading");
  const box = await heading.boundingBox();
  if (!box) throw new Error("Card heading missing");
  const x = Math.round(box.x + 28);
  const y = Math.round(box.y + 16);
  await page.mouse.move(x, y);
  await page.clock.runFor(100);
  await page.mouse.click(x, y);
  await page.clock.runFor(200);
  const wave = page
    .locator(
      '.site-interaction-layer [data-wave]:not([style*="display: none"])',
    )
    .first();
  const position = () =>
    wave.evaluate((el: SVGGElement) => {
      const matrix = el.transform.baseVal.consolidate()?.matrix;
      return { x: matrix?.e, y: matrix?.f };
    });
  expect(await position()).toEqual({ x, y });
  await page.evaluate(() => window.scrollBy({ top: 180, behavior: "instant" }));
  await page.clock.runFor(300);
  expect(await position()).toEqual({ x, y });
  const pointer = await page
    .locator("[data-pointer-field]")
    .evaluate((el: SVGGElement) => {
      const matrix = el.transform.baseVal.consolidate()?.matrix;
      return { x: matrix?.e, y: matrix?.f };
    });
  expect(pointer).toEqual({ x, y });
  await mkdir(".qa/interaction", { recursive: true });
  await page.screenshot({ path: ".qa/interaction/scrolled-wave.png" });
  await page.clock.runFor(2300);
  const paragraph = card.locator("p").first();
  await paragraph.scrollIntoViewIfNeeded();
  const prose = await paragraph.boundingBox();
  if (!prose) throw new Error("Paragraph missing");
  await page.mouse.move(prose.x + 3, prose.y + 10);
  await page.mouse.down();
  await page.mouse.move(
    prose.x + Math.min(prose.width - 5, 210),
    prose.y + 10,
    { steps: 12 },
  );
  await page.mouse.up();
  await page.clock.runFor(150);
  expect(
    await page.evaluate(() => window.getSelection()?.toString().length ?? 0),
  ).toBeGreaterThan(5);
  await expect(
    page.locator(
      '.site-interaction-layer [data-wave]:not([style*="display: none"])',
    ),
  ).toHaveCount(0);
  await page
    .getByRole("link", { name: "Explore automatic TLS", exact: true })
    .click();
  await expect(page).toHaveURL(/\/docs\/tls\/$/);
  await expect(
    page.locator(
      '.site-interaction-layer [data-wave]:not([style*="display: none"])',
    ),
  ).toHaveCount(0);
});
