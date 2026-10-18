import { mkdir } from "node:fs/promises";
import { expect, type Page, test } from "@playwright/test";

async function setup(page: Page) {
  await page.clock.install({ time: new Date("2026-01-01T00:00:00Z") });
  await page.clock.pauseAt(new Date("2026-01-01T00:00:01Z"));
  await page.goto("/");
  await page.clock.runFor(1600);
}

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
