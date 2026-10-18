import { mkdir } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";

const field = (page: Page) => page.locator(".site-background > svg");
const interaction = (page: Page) =>
  page.locator(".site-interaction-layer > svg");
const graphic = (page: Page) =>
  page
    .locator(".site-interaction-layer svg > g")
    .evaluateAll((nodes) => nodes.map((node) => node.outerHTML).join(""));
const ambient = (page: Page) =>
  field(page)
    .locator(":scope > g")
    .evaluate((el) => el.outerHTML);

test("mouse toggle releases pointer listeners while ambient motion and hero keep playing", async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem("dockrouter-motion", "off");
    const add = EventTarget.prototype.addEventListener;
    const remove = EventTarget.prototype.removeEventListener;
    const listeners: {
      target: EventTarget;
      type: string;
      listener: unknown;
    }[] = [];
    const types = [
      "pointermove",
      "pointerdown",
      "pointerup",
      "pointercancel",
      "pointerleave",
      "scroll",
      "resize",
      "blur",
      "visibilitychange",
    ];
    EventTarget.prototype.addEventListener = function (
      type,
      listener,
      options,
    ) {
      if (
        [window, document, document.documentElement].includes(
          this as Window & Document & HTMLElement,
        ) &&
        types.includes(type) &&
        // Playwright's temporary hit-target interceptors belong to the harness.
        !String(listener).includes("_hitTargetInterceptor") &&
        !listeners.some(
          (entry) =>
            entry.target === this &&
            entry.type === type &&
            entry.listener === listener,
        )
      )
        listeners.push({ target: this, type, listener });
      return add.call(this, type, listener, options);
    };
    EventTarget.prototype.removeEventListener = function (
      type,
      listener,
      options,
    ) {
      const index = listeners.findIndex(
        (entry) =>
          entry.target === this &&
          entry.type === type &&
          entry.listener === listener,
      );
      if (index >= 0) listeners.splice(index, 1);
      return remove.call(this, type, listener, options);
    };
    Object.assign(window, { motionListenerCount: () => listeners.length });
  });
  await page.clock.install();
  await page.goto("/");
  await page.clock.runFor(1600);
  await expect(interaction(page)).toHaveAttribute("data-motion", "paused");
  await expect(field(page)).toHaveAttribute("data-motion", "running");
  await field(page)
    .locator('[data-object="10"]')
    .evaluate((el) => el.setAttribute("data-continuity", "kept"));
  const listenerCount = () =>
    page.evaluate(() =>
      (
        window as unknown as { motionListenerCount: () => number }
      ).motionListenerCount(),
    );
  const baseline = await listenerCount();
  for (let i = 0; i < 3; i++) {
    const on = page.getByRole("button", {
      name: "Enable mouse effects",
      exact: true,
    });
    await on.focus();
    await on.press(i % 2 ? "Space" : "Enter");
    await expect(interaction(page)).toHaveAttribute("data-motion", "running");
    await expect(field(page).locator('[data-object="10"]')).toHaveAttribute(
      "data-continuity",
      "kept",
    );
    expect(await listenerCount()).toBe(baseline + 6);
    await page.mouse.click(700, 120);
    await page.clock.runFor(180);
    expect(
      await page.locator('[data-wave]:not([style*="display: none"])').count(),
    ).toBeGreaterThan(0);
    const off = page.getByRole("button", {
      name: "Disable mouse effects",
      exact: true,
    });
    await expect(off).toHaveAttribute("title", "Disable mouse effects");
    await expect(off).toHaveAttribute("aria-pressed", "true");
    await off.click();
    await expect(interaction(page)).toHaveAttribute("data-motion", "paused");
    await expect(field(page)).toHaveAttribute("data-motion", "running");
    await expect(field(page).locator('[data-object="10"]')).toHaveAttribute(
      "data-continuity",
      "kept",
    );
    expect(await listenerCount()).toBe(baseline);
    await expect(
      page.locator('[data-wave]:not([style*="display: none"])'),
    ).toHaveCount(0);
    await expect(
      page.locator(".site-interaction-layer > svg > g"),
    ).toHaveAttribute("opacity", "0");
    const still = await graphic(page);
    const drifting = await ambient(page);
    await page.mouse.move(500, 200);
    await page.mouse.click(700, 120);
    await page.clock.runFor(2000);
    expect(await graphic(page)).toBe(still);
    expect(await ambient(page)).not.toBe(drifting);
  }
  expect(
    await page.evaluate(() => localStorage.getItem("dockrouter-motion")),
  ).toBe("off");
  await page
    .getByRole("button", { name: "Route to Realtime", exact: true })
    .click();
  await expect(page.locator(".hero-routing")).toHaveAttribute(
    "data-playing",
    "true",
  );
  await expect(page.locator(".hero-incoming")).toContainText("GET /socket");
  await page.clock.runFor(1200);
  await expect(
    page.locator('.hero-routing [aria-current="step"]'),
  ).toContainText("Secure");
});

test("motion choice survives reload and navigation; explicit choice overrides the initial system default", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(field(page)).toHaveAttribute("data-motion", "reduced");
  const enable = page.getByRole("button", {
    name: "Enable mouse effects",
    exact: true,
  });
  await expect(enable).toBeEnabled();
  await enable.click();
  await expect(field(page)).toHaveAttribute("data-motion", "running");
  expect(
    await page.evaluate(() => localStorage.getItem("dockrouter-motion")),
  ).toBe("on");
  await page.reload();
  await expect(field(page)).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page
    .getByRole("button", { name: "Disable mouse effects", exact: true })
    .click();
  await page
    .getByRole("link", { name: "Documentation", exact: true })
    .first()
    .click();
  await expect(page).toHaveURL(/\/docs\/getting-started\//);
  await expect(interaction(page)).toHaveAttribute("data-motion", "paused");
  await expect(field(page)).toHaveAttribute("data-motion", "running");
  await page.reload();
  await expect(interaction(page)).toHaveAttribute("data-motion", "paused");
  await expect(field(page)).toHaveAttribute("data-motion", "running");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(field(page)).toHaveAttribute("data-motion", "reduced");
  await expect(interaction(page)).toHaveAttribute("data-motion", "paused");
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await expect(field(page)).toHaveAttribute("data-motion", "running");
  await expect(interaction(page)).toHaveAttribute("data-motion", "paused");
});

test("motion toggle works without storage and synchronizes cross-tab changes", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get: () => {
        throw new Error("Storage blocked");
      },
    }),
  );
  await page.goto("/");
  await page
    .getByRole("button", { name: "Disable mouse effects", exact: true })
    .click();
  await expect(interaction(page)).toHaveAttribute("data-motion", "paused");
  await page
    .getByRole("button", { name: "Enable mouse effects", exact: true })
    .click();
  await expect(field(page)).toHaveAttribute("data-motion", "running");
  await page.evaluate(() =>
    window.dispatchEvent(
      new StorageEvent("storage", {
        key: "dockrouter-motion",
        newValue: "off",
      }),
    ),
  );
  await expect(
    page.getByRole("button", { name: "Enable mouse effects", exact: true }),
  ).toHaveAttribute("aria-pressed", "false");
  await expect(interaction(page)).toHaveAttribute("data-motion", "paused");
});

for (const width of [320, 375, 768, 1440]) {
  test(`motion control sits beside appearance and fits at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const button = page.getByRole("button", {
      name: "Disable mouse effects",
      exact: true,
    });
    await expect(button).toBeVisible();
    const box = await button.boundingBox();
    const theme = await page
      .getByRole("button", { name: /Color theme:/ })
      .boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
    expect(box?.x).toBeGreaterThanOrEqual(
      (theme?.x ?? 0) + (theme?.width ?? 0),
    );
    expect(Math.abs((box?.y ?? 0) - (theme?.y ?? 0))).toBeLessThan(2);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(width);
    await button.focus();
    await expect(page.locator(".motion-tooltip")).toBeVisible();
    await mkdir(".qa/motion-toggle", { recursive: true });
    await page.screenshot({ path: `.qa/motion-toggle/header-${width}.png` });
  });
}
