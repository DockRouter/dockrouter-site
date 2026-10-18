import { mkdir } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";

const field = (page: Page) => page.locator(".site-background > svg");
const picture = (page: Page) =>
  page
    .locator(".site-background > svg > g, .site-interaction-layer > svg > g")
    .evaluateAll((nodes) => nodes.map((node) => node.outerHTML).join(""));
const active = (page: Page, kind: string) =>
  page
    .locator(".site-interaction-layer")
    .locator(`[data-${kind}]:not([style*="display: none"])`);
async function setup(page: Page) {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  // The app has not loaded yet; reserve a future target beyond host jitter.
  await page.clock.pauseAt(new Date("2026-01-02T00:00:00Z"));
  await page.goto("/");
  await page.clock.runFor(1500);
  await expect(field(page)).toHaveAttribute("data-motion", "running");
}

test("SVG field reacts locally, caps successive clicks, expires and excludes controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page);
  const graphics = page.locator(
    ".site-background svg *, .site-interaction-layer svg *",
  );
  const total = await graphics.count();
  const positions = () =>
    field(page)
      .locator("[data-object]")
      .evaluateAll((nodes) =>
        nodes.map((node) => {
          const matrix = (node as SVGGElement).transform.baseVal.consolidate()
            ?.matrix;
          return { x: matrix?.e ?? 0, y: matrix?.f ?? 0 };
        }),
      );
  const before = await positions();
  const index = 5;
  await page.mouse.move(before[index].x + 10, before[index].y + 10);
  await page.clock.runFor(400);
  const after = await positions();
  expect(
    Math.hypot(
      after[index].x - before[index].x,
      after[index].y - before[index].y,
    ),
  ).toBeGreaterThan(3);
  expect(
    Math.hypot(
      after[after.length - 1].x - before[before.length - 1].x,
      after[after.length - 1].y - before[before.length - 1].y,
    ),
  ).toBeLessThan(1);
  await page.mouse.move(710, 120);
  await page.clock.runFor(120);
  expect(await active(page, "trail").count()).toBeGreaterThan(0);
  await page
    .getByRole("button", { name: "Route to Realtime", exact: true })
    .click();
  await page.clock.runFor(100);
  await expect(active(page, "wave")).toHaveCount(0);
  const variants = new Set<string>();
  for (let i = 0; i < 24; i++) {
    await page.mouse.click(700 + (i % 3) * 10, 120);
    await page.clock.runFor(100);
    expect(await active(page, "wave").count()).toBeLessThanOrEqual(5);
    expect(await active(page, "spark").count()).toBeLessThanOrEqual(30);
    for (const variant of await active(page, "wave").evaluateAll((nodes) =>
      nodes.map((node) => node.getAttribute("data-variant") ?? ""),
    ))
      variants.add(variant);
  }
  expect(variants.size).toBe(3);
  expect(await graphics.count()).toBe(total);
  await page.mouse.move(1, 1);
  await page.clock.runFor(2400);
  await expect(active(page, "wave")).toHaveCount(0);
  await expect(active(page, "spark")).toHaveCount(0);
  await expect(active(page, "trail")).toHaveCount(0);
  await page.getByRole("link", { name: "Start routing", exact: true }).click();
  await expect(page).toHaveURL(/#quickstart$/);
});

test("shared background spans scrolling sections, footer and client navigation without resetting pause", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await setup(page);
  await field(page).evaluate((el) =>
    el.setAttribute("data-test-instance", "persistent"),
  );
  const home = await picture(page);
  for (const target of ["#features", "#quickstart", ".site-footer"]) {
    await page.locator(target).scrollIntoViewIfNeeded();
    await page.clock.runFor(400);
    await expect(field(page)).toHaveAttribute("data-motion", "running");
    expect((await field(page).boundingBox())?.y).toBe(0);
    expect(await picture(page)).not.toBe(home);
  }
  await mkdir(".qa/svg", { recursive: true });
  await page.screenshot({ path: ".qa/svg/footer-wide.png" });
  await page
    .getByRole("button", { name: "Animasyonları kapat", exact: true })
    .click();
  const paused = await picture(page);
  await page.clock.runFor(4000);
  expect(await picture(page)).toBe(paused);
  await page
    .getByRole("link", { name: "Documentation", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/docs\/getting-started\//);
  await expect(field(page)).toHaveAttribute("data-test-instance", "persistent");
  await expect(field(page)).toHaveAttribute("data-motion", "paused");
  await page
    .getByRole("button", { name: "Animasyonları aç", exact: true })
    .press("Enter");
  await page.clock.runFor(200);
  expect(await picture(page)).not.toBe(paused);
  await page
    .getByRole("heading", { name: "Meet DockRouter", exact: true })
    .waitFor();
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await page.clock.runFor(300);
  await page.screenshot({ path: ".qa/svg/docs-wide.png" });
});

test("hidden tab and invisible layer suspend mutations and resume safely", async ({
  page,
}) => {
  await setup(page);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(field(page)).toHaveAttribute("data-motion", "hidden");
  const hidden = await picture(page);
  await page.clock.runFor(60000);
  expect(await picture(page)).toBe(hidden);
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(field(page)).toHaveAttribute("data-motion", "running");
  await page.clock.runFor(100);
  expect(await picture(page)).not.toBe(hidden);
  await page.locator(".site-background").evaluate((el: HTMLElement) => {
    el.style.display = "none";
  });
  await expect(field(page)).toHaveAttribute("data-motion", "offscreen");
  const offscreen = await picture(page);
  await page.clock.runFor(5000);
  expect(await picture(page)).toBe(offscreen);
  await page.locator(".site-background").evaluate((el: HTMLElement) => {
    el.style.display = "";
  });
  await expect(field(page)).toHaveAttribute("data-motion", "running");
});

test("reduced motion is still while theme and preference changes remain useful", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  await expect(field(page)).toHaveAttribute("data-motion", "reduced");
  await expect(
    page.getByRole("button", {
      name: "Animasyonları aç",
    }),
  ).toHaveAttribute("aria-pressed", "false");
  const still = await picture(page);
  await page.mouse.click(700, 120);
  await page.clock.runFor(3000);
  expect(await picture(page)).toBe(still);
  await expect(active(page, "wave")).toHaveCount(0);
  const stroke = () =>
    field(page)
      .locator(".background-object")
      .first()
      .evaluate((el) => getComputedStyle(el).stroke);
  const light = await stroke();
  await page.getByRole("button", { name: /Color theme:/ }).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  expect(await stroke()).not.toBe(light);
  expect(await picture(page)).toBe(still);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(field(page)).toHaveAttribute("data-motion", "running");
  await page.clock.runFor(300);
  expect(await picture(page)).not.toBe(still);
});

test("idle pacing and resize keep the SVG work budget bounded", async ({
  page,
}) => {
  await page.setViewportSize({ width: 3840, height: 1080 });
  await setup(page);
  const group = field(page).locator(":scope > g");
  await group.evaluate((el: SVGGElement) => {
    el.dataset.testFrames = "0";
    new MutationObserver((records) => {
      el.dataset.testFrames = String(
        Number(el.dataset.testFrames) + records.length,
      );
    }).observe(el, { attributes: true, attributeFilter: ["opacity"] });
  });
  const frames = async () =>
    Number(await group.getAttribute("data-test-frames"));
  await page.clock.runFor(1000);
  const idle = await frames();
  await page.mouse.move(1900, 120);
  await page.clock.runFor(1000);
  const active = (await frames()) - idle;
  // RAF cadence varies across hosts; these are ceilings, not minimum FPS.
  expect(idle).toBeGreaterThan(0);
  expect(idle).toBeLessThanOrEqual(31);
  expect(active).toBeGreaterThan(idle * 1.5);
  expect(active).toBeLessThanOrEqual(61);
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(field(page).locator("[data-object]")).toHaveCount(12);
  expect((await field(page).boundingBox())?.width).toBe(375);
  expect(await field(page).locator("*").count()).toBeLessThan(450);
});

for (const width of [375, 1920, 3840]) {
  for (const theme of ["light", "dark"]) {
    test(`SVG background covers viewport and stays bounded at ${width}px ${theme}`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await page.setViewportSize({ width, height: width === 375 ? 812 : 1080 });
      await page.addInitScript(
        (value) => localStorage.setItem("dockrouter-theme", value),
        theme,
      );
      await setup(page);
      await expect(page.locator(".site-background")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      await expect(page.locator("canvas")).toHaveCount(0);
      const box = await field(page).boundingBox();
      expect(box?.width).toBe(width);
      expect(box?.height).toBe(width === 375 ? 812 : 1080);
      expect(await field(page).locator("[data-object]").count()).toBe(
        width === 375 ? 12 : width === 3840 ? 65 : 35,
      );
      expect(await field(page).locator("*").count()).toBeLessThan(450);
      expect(
        await page
          .locator(".site-background svg *, .site-interaction-layer svg *")
          .count(),
      ).toBeLessThan(650);
      await expect(page.locator(".site-interaction-layer")).toHaveAttribute(
        "aria-hidden",
        "true",
      );
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      await mkdir(".qa/svg", { recursive: true });
      await page.screenshot({ path: `.qa/svg/home-${width}-${theme}.png` });
      await page.locator("#features").scrollIntoViewIfNeeded();
      await page.clock.runFor(300);
      await page.screenshot({ path: `.qa/svg/features-${width}-${theme}.png` });
      expect(errors).toEqual([]);
    });
  }
}

test.describe("touch gestures", () => {
  test.use({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });
  test("blank tap produces a wave while a native swipe scrolls without effects", async ({
    page,
    context,
  }) => {
    await setup(page);
    await page.touchscreen.tap(185, 92);
    await page.clock.runFor(300);
    expect(await active(page, "wave").count()).toBe(1);
    await page.clock.runFor(2400);
    const client = await context.newCDPSession(page);
    await client.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: 18, y: 650 }],
    });
    for (const y of [610, 550, 490, 420]) {
      await client.send("Input.dispatchTouchEvent", {
        type: "touchMove",
        touchPoints: [{ x: 18, y }],
      });
      await page.clock.runFor(32);
    }
    await client.send("Input.dispatchTouchEvent", {
      type: "touchEnd",
      touchPoints: [],
    });
    await client.detach();
    await page.clock.runFor(300);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    await expect(active(page, "wave")).toHaveCount(0);
    await expect(active(page, "trail")).toHaveCount(0);
    expect((await field(page).boundingBox())?.y).toBe(0);
  });
});
