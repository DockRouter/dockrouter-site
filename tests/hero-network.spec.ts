import { mkdir } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";

declare global {
  interface Window {
    networkProbe: {
      draws: number;
      rings: number;
      peakRings: number;
      trails: number;
    };
  }
}

async function setup(page: Page) {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
  // Observe actual drawing, without adding debug state to the shipped scene.
  await page.addInitScript(() => {
    window.networkProbe = { draws: 0, rings: 0, peakRings: 0, trails: 0 };
    const clear = CanvasRenderingContext2D.prototype.clearRect;
    const arc = CanvasRenderingContext2D.prototype.arc;
    CanvasRenderingContext2D.prototype.clearRect = function (...args) {
      if (this.canvas.closest(".hero-network")) {
        window.networkProbe.draws++;
        window.networkProbe.rings = 0;
        window.networkProbe.trails = 0;
      }
      return clear.apply(this, args);
    };
    CanvasRenderingContext2D.prototype.arc = function (...args) {
      if (
        this.canvas.closest(".hero-network") &&
        args[2] > 4 &&
        args[2] <= 22
      ) {
        window.networkProbe.trails++;
      }
      if (this.canvas.closest(".hero-network") && args[2] > 30) {
        window.networkProbe.rings++;
        window.networkProbe.peakRings = Math.max(
          window.networkProbe.peakRings,
          window.networkProbe.rings,
        );
      }
      return arc.apply(this, args);
    };
  });
  await page.goto("/");
  await page.clock.runFor(1600);
  await expect(page.locator(".hero-network canvas")).toHaveAttribute(
    "data-motion",
    "running",
  );
}

const picture = (page: Page) =>
  page
    .locator(".hero-network canvas")
    .evaluate((el: HTMLCanvasElement) => el.toDataURL());

test("network responds locally, bounds repeated taps, expires effects and excludes controls", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await setup(page);
  const first = await picture(page);
  await page.clock.runFor(500);
  expect(await picture(page)).not.toBe(first);
  await page
    .getByRole("button", { name: "Route to Realtime", exact: true })
    .click();
  await page.clock.runFor(300);
  expect(await page.evaluate(() => window.networkProbe.peakRings)).toBe(0);
  const box = await page.locator(".hero-scene").boundingBox();
  if (!box) throw new Error("Hero scene missing");
  const x = box.width / 2;
  const y = box.y + 34;
  await page.mouse.move(x, y);
  const beforePointer = await picture(page);
  await page.clock.runFor(180);
  expect(await picture(page)).not.toBe(beforePointer);
  expect(await page.evaluate(() => window.networkProbe.trails)).toBeGreaterThan(
    0,
  );
  for (let i = 0; i < 24; i++) {
    await page.mouse.click(x + (i % 3) * 10, y);
    await page.clock.runFor(100);
  }
  await page.clock.runFor(300);
  const probe = await page.evaluate(() => window.networkProbe);
  expect(probe.peakRings).toBeGreaterThan(2);
  expect(probe.peakRings).toBeLessThanOrEqual(10);
  await page.mouse.move(1, 1);
  await page.clock.runFor(2200);
  expect(await page.evaluate(() => window.networkProbe.rings)).toBe(0);
  expect(await page.evaluate(() => window.networkProbe.trails)).toBe(0);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Start routing", exact: true }).click();
  await expect(page).toHaveURL(/#quickstart$/);
});

test("idle frame budget drops and high-DPI 4K raster stays bounded through resize", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 3840, height: 1200 },
    deviceScaleFactor: 3,
  });
  try {
    const page = await context.newPage();
    await setup(page);
    const pixels = await page
      .locator(".hero-network canvas")
      .evaluate((el: HTMLCanvasElement) => el.width * el.height);
    expect(pixels).toBeLessThanOrEqual(5_005_000);
    const idleStart = await page.evaluate(() => window.networkProbe.draws);
    await page.clock.runFor(1000);
    const idleEnd = await page.evaluate(() => window.networkProbe.draws);
    await page.mouse.move(1920, 125);
    await page.clock.runFor(1000);
    const activeEnd = await page.evaluate(() => window.networkProbe.draws);
    expect(activeEnd - idleEnd).toBeGreaterThan((idleEnd - idleStart) * 1.5);
    await page.setViewportSize({ width: 375, height: 812 });
    await expect
      .poll(() =>
        page
          .locator(".hero-network canvas")
          .evaluate((el: HTMLCanvasElement) => el.width),
      )
      .toBeLessThanOrEqual(563);
    expect(
      await page
        .locator(".hero-network canvas")
        .evaluate((el) => el.getBoundingClientRect().width),
    ).toBe(375);
  } finally {
    await context.close();
  }
});

test("network freezes when paused, offscreen or hidden and cleans up on navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await setup(page);
  const canvas = page.locator(".hero-network canvas");
  await page
    .getByRole("button", { name: "Pause background animation", exact: true })
    .click();
  await expect(canvas).toHaveAttribute("data-motion", "paused");
  const still = await picture(page);
  await page.clock.runFor(3000);
  expect(await picture(page)).toBe(still);
  await page
    .getByRole("button", { name: "Play background animation", exact: true })
    .press("Enter");
  await expect(canvas).toHaveAttribute("data-motion", "running");
  await page.clock.runFor(300);
  expect(await picture(page)).not.toBe(still);
  await page.locator("#features").scrollIntoViewIfNeeded();
  await expect(canvas).toHaveAttribute("data-motion", "offscreen");
  const offscreenDraws = await page.evaluate(() => window.networkProbe.draws);
  await page.clock.runFor(10000);
  expect(await page.evaluate(() => window.networkProbe.draws)).toBe(
    offscreenDraws,
  );
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: "instant" }));
  await expect(canvas).toHaveAttribute("data-motion", "running");
  await page.clock.runFor(100);
  // Exercise the visibility API boundary independently of headless tab focus.
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(canvas).toHaveAttribute("data-motion", "hidden");
  const hiddenDraws = await page.evaluate(() => window.networkProbe.draws);
  await page.clock.runFor(10000);
  expect(await page.evaluate(() => window.networkProbe.draws)).toBe(
    hiddenDraws,
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(canvas).toHaveAttribute("data-motion", "running");
  await page
    .getByRole("link", { name: "Documentation", exact: true })
    .first()
    .click();
  await expect(canvas).toHaveCount(0);
  const unmountedDraws = await page.evaluate(() => window.networkProbe.draws);
  await page.clock.runFor(3000);
  expect(await page.evaluate(() => window.networkProbe.draws)).toBe(
    unmountedDraws,
  );
});

test("reduced motion stays still, updates theme and can change at runtime", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.clock.install();
  await page.goto("/");
  const canvas = page.locator(".hero-network canvas");
  await expect(canvas).toHaveAttribute("data-motion", "reduced");
  await expect(
    page.getByRole("button", {
      name: "Background motion disabled by your preference",
    }),
  ).toBeDisabled();
  const still = await picture(page);
  await page.mouse.click(700, 110);
  await page.clock.runFor(5000);
  expect(await picture(page)).toBe(still);
  await page.getByRole("button", { name: /Color theme/ }).click();
  await page.getByRole("radio", { name: "Dark", exact: true }).check();
  expect(await picture(page)).not.toBe(still);
  const dark = await picture(page);
  await page.clock.runFor(2000);
  expect(await picture(page)).toBe(dark);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(canvas).toHaveAttribute("data-motion", "running");
  await page.clock.runFor(300);
  expect(await picture(page)).not.toBe(dark);
});

for (const width of [375, 1920, 3840]) {
  for (const theme of ["light", "dark"]) {
    test(`full-bleed network at ${width}px in ${theme} theme`, async ({
      page,
    }) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await page.setViewportSize({ width, height: width === 375 ? 812 : 1080 });
      await page.addInitScript(
        (value) => localStorage.setItem("dockrouter-theme", value),
        theme,
      );
      await setup(page);
      const dimensions = await page
        .locator(".hero-network canvas")
        .evaluate((el: HTMLCanvasElement) => ({
          width: el.getBoundingClientRect().width,
          height: el.getBoundingClientRect().height,
          pixels: el.width * el.height,
        }));
      const hero = await page.locator(".hero-scene").boundingBox();
      expect(dimensions.width).toBe(width);
      expect(dimensions.height).toBeCloseTo(hero?.height ?? 0, 0);
      expect(dimensions.pixels).toBeLessThanOrEqual(5_005_000);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth),
      ).toBe(width);
      await mkdir(".qa/network", { recursive: true });
      await page
        .locator(".hero-scene")
        .screenshot({ path: `.qa/network/hero-${width}-${theme}.png` });
      expect(errors).toEqual([]);
    });
  }
}

test.describe("touch scene", () => {
  test.use({
    viewport: { width: 375, height: 812 },
    hasTouch: true,
    isMobile: true,
    deviceScaleFactor: 3,
  });
  test("tap reacts, swipe scrolls without a burst, high DPR is capped", async ({
    page,
    context,
  }) => {
    await setup(page);
    const box = await page.locator(".hero-scene").boundingBox();
    if (!box) throw new Error("Hero missing");
    await page.touchscreen.tap(185, box.y + 18);
    await page.clock.runFor(400);
    expect(
      await page.evaluate(() => window.networkProbe.rings),
    ).toBeGreaterThan(0);
    await page.clock.runFor(2200);
    await page.evaluate(() => {
      window.networkProbe.peakRings = 0;
    });
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
    await page.clock.runFor(400);
    expect(await page.evaluate(() => scrollY)).toBeGreaterThan(0);
    expect(await page.evaluate(() => window.networkProbe.peakRings)).toBe(0);
    const rasterWidth = await page
      .locator(".hero-network canvas")
      .evaluate((el: HTMLCanvasElement) => el.width);
    expect(rasterWidth).toBeLessThanOrEqual(563);
  });
});
