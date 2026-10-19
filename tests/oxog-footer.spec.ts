import { mkdir } from "node:fs/promises";
import { expect, test } from "@playwright/test";

test("OXOG signature repeats its drawing and suspends outside the viewport", async ({
  page,
}) => {
  await page.addInitScript(() =>
    localStorage.setItem("dockrouter-motion", "off"),
  );
  await page.goto("/");
  const mark = page.locator(".oxog-mark");
  await expect(mark).toHaveAttribute("data-visible", "false");
  await expect(mark.locator("path").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await mark.scrollIntoViewIfNeeded();
  await expect(mark).toHaveAttribute("data-visible", "true");
  const animation = await mark.locator("path").evaluateAll((paths) =>
    paths.map((path) => {
      const style = getComputedStyle(path);
      return [
        style.animationDuration,
        style.animationIterationCount,
        style.animationDelay,
      ];
    }),
  );
  expect(animation).toEqual([
    ["6s", "infinite", "0s"],
    ["6s", "infinite", "0.15s"],
    ["6s", "infinite", "0.3s"],
    ["6s", "infinite", "0.45s"],
  ]);
  // Sample native CSS animation time without waiting through an entire loop.
  const offsets = await mark
    .locator("path")
    .first()
    .evaluate((path) => {
      const draw = path.getAnimations()[0];
      draw.pause();
      return [0, 2000, 5900, 6000, 8000].map((time) => {
        draw.currentTime = time;
        return Number.parseFloat(getComputedStyle(path).strokeDashoffset);
      });
    });
  expect(offsets).toEqual([400, 0, 0, 400, 0]);
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(mark).toHaveAttribute("data-visible", "false");
  await expect(mark.locator("path").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await mark.scrollIntoViewIfNeeded();
  await expect(mark).toHaveAttribute("data-visible", "true");
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => true,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(mark).toHaveAttribute("data-visible", "false");
  await expect(mark.locator("path").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.evaluate(() => {
    Object.defineProperty(document, "hidden", {
      configurable: true,
      get: () => false,
    });
    document.dispatchEvent(new Event("visibilitychange"));
  });
  await expect(mark).toHaveAttribute("data-visible", "true");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(mark.locator("path").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(mark.locator("path").first()).toHaveCSS(
    "stroke-dashoffset",
    "0px",
  );
});

for (const width of [375, 1440]) {
  for (const theme of ["light", "dark"]) {
    test(`OXOG reference card at ${width}px in ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({
        reducedMotion: "reduce",
        colorScheme: theme as "light" | "dark",
      });
      await page.goto("/");
      await page.evaluate(() => document.fonts.ready);
      const card = page.locator(".oxog-studio");
      await card.scrollIntoViewIfNeeded();
      await expect(card).toHaveAttribute("href", "https://oxog.net");
      await expect(card.getByRole("heading")).toHaveText(
        "Small studio. Big ideas.",
      );
      await expect(card.locator("p")).toHaveText(
        "Explore the tools and infrastructure from Oxog.",
      );
      await expect(card).toContainText("PART OF A BIGGER PICTURE");
      await expect(card).toContainText("Meet oxog.net");
      await expect(card.locator(".oxog-mark path")).toHaveCount(4);
      await expect(card.locator(".oxog-mark")).toHaveCSS(
        "width",
        width === 375 ? "65px" : "105px",
      );
      await expect(card.locator("h2")).toHaveCSS(
        "font-size",
        width === 375 ? "25px" : "35px",
      );
      await expect(card.locator("h2")).toHaveCSS(
        "font-family",
        '"Space Grotesk Variable", sans-serif',
      );
      await expect(card).toHaveCSS(
        "background-color",
        theme === "light" ? "rgb(250, 246, 238)" : "rgb(17, 20, 38)",
      );
      await expect(page.locator(".site-footer")).not.toContainText(
        "OXOGNET OÜ",
      );
      await expect(
        page.locator('.site-footer a[href="https://wrongstack.dev"]'),
      ).toHaveCount(0);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      await mkdir(".qa/oxog", { recursive: true });
      await page.screenshot({ path: `.qa/oxog/footer-${theme}-${width}.png` });
      await card.focus();
      await expect(card).toBeFocused();
    });
  }
}
