import { mkdir, writeFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

const viewports = [375, 768, 1024, 1440, 1920, 2560];
const paths = [
  "/",
  "/docs/",
  "/docs/configuration/",
  "/download/",
  "/brand/",
  "/changelog/",
];
for (const width of viewports) {
  test(`shared layout uses available space and aligned containers at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width >= 1920 ? 1080 : 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await mkdir(".qa/layout", { recursive: true });
    for (const path of paths) {
      await page.goto(path);
      const header = await page.locator(".header-inner").boundingBox();
      expect(header).not.toBeNull();
      if (width >= 1920) {
        expect(header?.width).toBeGreaterThanOrEqual(1680);
        expect(header?.width).toBeLessThanOrEqual(1750);
      }
      if (width === 1440) {
        expect(header?.width).toBeGreaterThanOrEqual(1320);
        expect(header?.width).toBeLessThanOrEqual(1360);
      }
      const containers = await page.locator(".container").evaluateAll((nodes) =>
        nodes.map((node) => {
          const b = node.getBoundingClientRect();
          return { x: b.x, width: b.width, right: b.right };
        }),
      );
      for (const box of containers) {
        expect(Math.abs(box.x - (header?.x ?? 0)), path).toBeLessThan(1.5);
        expect(Math.abs(box.width - (header?.width ?? 0)), path).toBeLessThan(
          1.5,
        );
        expect(box.x, path).toBeGreaterThanOrEqual(0);
        expect(box.right, path).toBeLessThanOrEqual(width + 0.5);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        path,
      ).toBe(true);
      if (path === "/docs/configuration/") {
        const prose = await page
          .locator(".doc-section>p")
          .first()
          .boundingBox();
        expect(prose?.width).toBeLessThanOrEqual(760);
        if (width >= 1440) {
          const table = await page
            .locator(".doc-table-wrap")
            .first()
            .boundingBox();
          expect(table?.width).toBeGreaterThan((prose?.width ?? 0) + 100);
        }
      }
      if (path === "/docs/" && width >= 1280) {
        const first = await page.locator(".brand-grid>a").nth(0).boundingBox();
        const third = await page.locator(".brand-grid>a").nth(2).boundingBox();
        expect(Math.abs((first?.y ?? 0) - (third?.y ?? 0))).toBeLessThan(1.5);
      }
      if (path === "/") {
        if (width === 375) {
          // Read both in one frame: their shared entrance transform is moving.
          const buttonRows = await page
            .locator(".dock-hero .hero-buttons .button")
            .evaluateAll((buttons) =>
              buttons.map((button) => button.getBoundingClientRect().y),
            );
          expect(Math.abs(buttonRows[0] - buttonRows[1])).toBeLessThan(1.5);
        }
        await writeFile(
          `.qa/layout/metrics-${width}.json`,
          JSON.stringify(
            {
              viewport: width,
              container: header?.width,
              gutter: header?.x,
              rootFont: await page
                .locator("html")
                .evaluate((el) => getComputedStyle(el).fontSize),
            },
            null,
            2,
          ),
        );
        const brand = await page.locator(".header-inner .logo").boundingBox();
        const actions = await page.locator(".header-actions").boundingBox();
        expect((brand?.x ?? 0) + (brand?.width ?? 0)).toBeLessThanOrEqual(
          actions?.x ?? 0,
        );
      }
      const name =
        path === "/" ? "home" : path.split("/").filter(Boolean).join("-");
      await page.screenshot({ path: `.qa/layout/${name}-${width}.png` });
      if (path === "/") {
        await page.locator(".site-footer").scrollIntoViewIfNeeded();
        await expect(page.locator(".studio-symbol path").last()).toHaveCSS(
          "stroke-dashoffset",
          "0px",
        );
        await page.screenshot({ path: `.qa/layout/footer-${width}.png` });
      }
    }
    expect(errors).toEqual([]);
  });
}
