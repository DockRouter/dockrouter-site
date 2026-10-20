import { mkdir, writeFile } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { docs } from "../src/lib/docs";

const routes = [
  "/",
  "/docs/",
  ...docs.map((d) => `/docs/${d.slug}/`),
  "/download/",
  "/brand/",
  "/changelog/",
  "/404.html",
];
const templates = [
  "/",
  "/docs/",
  "/docs/configuration/",
  "/download/",
  "/brand/",
  "/changelog/",
];
const phase = process.env.DESIGN_AUDIT_PHASE || "after";

test("200 percent zoom equivalent reflow preserves controls and keyboard table scrolling", async ({
  browser,
  baseURL,
}) => {
  // A 1280x900 screen at 200% zoom exposes a 640x450 CSS viewport at DPR 2.
  const context = await browser.newContext({
    baseURL,
    viewport: { width: 640, height: 450 },
    deviceScaleFactor: 2,
  });
  try {
    const page = await context.newPage();
    await page.goto("/download/");
    await page.getByLabel("Processor architecture").selectOption("arm64");
    await expect(
      page.getByRole("link", { name: /Download DockRouter/ }),
    ).toHaveAttribute("href", /linux_arm64\.tar\.gz$/);
    await page
      .getByRole("button", { name: "Search documentation", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Close search" }),
    ).toBeInViewport({ ratio: 1 });
    await page.getByRole("dialog").press("Escape");
    await expect(
      page.getByRole("button", { name: "Search documentation", exact: true }),
    ).toBeFocused();
    await page.goto("/docs/configuration/");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    // The table fits at 640px; at the narrow reflow limit it must scroll by key.
    await page.setViewportSize({ width: 320, height: 450 });
    const table = page.getByRole("region", {
      name: "Global environment table",
      exact: true,
    });
    await table.focus();
    expect(await table.evaluate((el) => el.scrollWidth > el.clientWidth)).toBe(
      true,
    );
    await table.press("ArrowRight");
    await expect
      .poll(() => table.evaluate((el) => el.scrollLeft))
      .toBeGreaterThan(0);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.setViewportSize({ width: 640, height: 450 });
    await mkdir(".qa/design/after", { recursive: true });
    await page.screenshot({ path: ".qa/design/after/zoom-200-equivalent.png" });
  } finally {
    await context.close();
  }
});

test("static content and documentation links remain available without JavaScript", async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    baseURL,
    javaScriptEnabled: false,
    viewport: { width: 375, height: 812 },
  });
  try {
    const page = await context.newPage();
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Stop configuring\.\s*Start shipping\./,
    );
    await expect(
      page.getByRole("heading", { name: /A route you can follow/ }),
    ).toBeVisible();
    await page
      .locator("footer")
      .getByRole("link", { name: "Documentation", exact: true })
      .click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Meet DockRouter",
    );
    await expect(page.locator("pre").first()).toContainText("dockrouter:");
  } finally {
    await context.close();
  }
});

test("local fonts render UI, code and Turkish characters without fallback glyphs", async ({
  page,
  context,
}) => {
  await page.goto("/docs/getting-started/");
  await page.evaluate(async () => {
    const probe = document.createElement("p");
    probe.id = "font-coverage-probe";
    probe.textContent = "ÇĞİÖŞÜ çğıöşü — DockRouter";
    document.querySelector("main")?.append(probe);
    await document.fonts.ready;
  });
  const session = await context.newCDPSession(page);
  await session.send("DOM.enable");
  await session.send("CSS.enable");
  const { root } = await session.send("DOM.getDocument");
  for (const [selector, family] of [
    ["h1", "Space Grotesk"],
    ["#font-coverage-probe", "Space Grotesk"],
    ["pre code", "JetBrains Mono"],
  ]) {
    const { nodeId } = await session.send("DOM.querySelector", {
      nodeId: root.nodeId,
      selector,
    });
    const { fonts } = await session.send("CSS.getPlatformFontsForNode", {
      nodeId,
    });
    expect(fonts.length, selector).toBeGreaterThan(0);
    expect(
      // Variable fonts may expose the named default (e.g. Space Grotesk Light).
      fonts.every(
        (font) =>
          font.isCustomFont &&
          (font.familyName === family ||
            font.familyName.startsWith(`${family} `)),
      ),
      JSON.stringify(fonts),
    ).toBe(true);
  }
  await session.detach();
});

test("layout remains usable immediately around its responsive breakpoints", async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const width of [
    719, 720, 800, 801, 900, 901, 980, 981, 1100, 1101, 1279, 1280,
  ]) {
    await page.setViewportSize({ width, height: 600 });
    for (const path of ["/", "/docs/configuration/", "/download/"]) {
      await page.goto(path);
      const boxes = await page
        .locator(".header-inner .logo, .header-actions")
        .evaluateAll((nodes) =>
          nodes.map((node) => {
            const b = node.getBoundingClientRect();
            return { left: b.left, right: b.right };
          }),
        );
      expect(boxes[0].right, `${width} ${path}`).toBeLessThanOrEqual(
        boxes[1].left + 1,
      );
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${width} ${path}`,
      ).toBe(true);
    }
  }
});

test("mobile menu Escape restores focus and its short-screen links remain reachable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 667, height: 280 });
  await page.goto("/");
  const trigger = page.getByRole("button", { name: "Open menu", exact: true });
  await trigger.click();
  const menu = page.getByRole("navigation", { name: "Mobile navigation" });
  await menu.getByRole("link", { name: "Documentation", exact: true }).focus();
  await menu.press("Escape");
  await expect(menu).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await trigger.click();
  const last = menu.getByRole("link", { name: "Source on GitHub" });
  await last.focus();
  await expect(last).toBeInViewport({ ratio: 1 });
  const header = await page.locator(".site-header").boundingBox();
  expect(header?.height).toBeLessThanOrEqual(280);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.setViewportSize({ width: 375, height: 667 });
  await expect(menu).not.toBeVisible();
});

test("documentation navigation identifies its section and short sidebars can scroll", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 500 });
  await page.goto("/docs/configuration/");
  await expect(
    page
      .getByRole("navigation", { name: "Main navigation" })
      .getByRole("link", { name: "Documentation", exact: true }),
  ).toHaveAttribute("aria-current", "location");
  const sidebar = page.locator(".docs-sidebar");
  const last = sidebar.getByRole("link", { name: /Version/ });
  await last.focus();
  await expect(last).toBeInViewport({ ratio: 1 });
  const bounds = await sidebar.boundingBox();
  expect(bounds?.height).toBeLessThan(420);
  await expect(
    page.getByRole("region", { name: "Global environment table", exact: true }),
  ).toBeVisible();
});

test("search stays inside short viewports, locks background scrolling and restores focus", async ({
  page,
}) => {
  await page.setViewportSize({ width: 667, height: 280 });
  await page.goto("/");
  const trigger = page.getByRole("button", {
    name: "Search documentation",
    exact: true,
  });
  await trigger.click();
  const dialog = page.getByRole("dialog");
  await expect(
    page.getByRole("button", { name: "Close search" }),
  ).toBeInViewport({ ratio: 1 });
  await expect(page.locator(".search-bottom")).toBeInViewport({ ratio: 1 });
  await expect(page.locator("html")).toHaveCSS("overflow-y", "hidden");
  await dialog.getByRole("link").last().focus();
  await expect(dialog.getByRole("link").last()).toBeInViewport({ ratio: 1 });
  await dialog.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(page.locator("html")).not.toHaveCSS("overflow-y", "hidden");
});

test("theme choices stay usable in landscape and keyboard-height viewports", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 280 });
  await page.goto("/");
  await page.getByRole("button", { name: /Color theme:/ }).click();
  const appearance = page.getByRole("dialog", { name: "Appearance" });
  const box = await appearance.boundingBox();
  if (!box) throw new Error("Appearance panel is missing");
  expect(box.y).toBeGreaterThanOrEqual(0);
  expect(box.y + box.height).toBeLessThanOrEqual(280);
  await appearance.getByRole("radio", { name: "System", exact: true }).focus();
  await expect(
    appearance.getByRole("radio", { name: "System", exact: true }),
  ).toBeInViewport({ ratio: 1 });
});

for (const theme of ["light", "dark"] as const) {
  for (const width of [320, 375, 390, 768, 1024, 1280, 1440, 1920, 2560]) {
    test(`design reflow ${width}px ${theme}`, async ({ page }) => {
      test.setTimeout(90000);
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
      const errors: string[] = [];
      page.on("pageerror", (e) => errors.push(`${page.url()}: ${e.message}`));
      await mkdir(`.qa/design/${phase}`, { recursive: true });
      for (const path of templates) {
        await page.goto(path);
        await page.evaluate(() => document.fonts.ready);
        const issue = await page.evaluate(() => {
          const shell = document.querySelector(".header-inner");
          const logo = document.querySelector(".header-inner .logo");
          const actions = document.querySelector(".header-actions");
          const content = document.querySelector("main");
          if (!shell || !logo || !actions || !content)
            throw new Error("Missing shared layout");
          const header = shell.getBoundingClientRect();
          const brand = logo.getBoundingClientRect();
          const controls = actions.getBoundingClientRect();
          const main = content.getBoundingClientRect();
          return {
            overflow: document.documentElement.scrollWidth > innerWidth,
            header: header.width,
            controlsOverlap: brand.right > controls.left + 1,
            mainRight: main.right,
            family: getComputedStyle(document.body).fontFamily,
          };
        });
        expect(issue.overflow, path).toBe(false);
        expect(issue.controlsOverlap, path).toBe(false);
        expect(issue.mainRight, path).toBeLessThanOrEqual(width + 1);
        if (width >= 1920)
          expect(issue.header, path).toBeGreaterThanOrEqual(1680);
        const slug = path.split("/").filter(Boolean).join("-") || "home";
        await page.screenshot({
          path: `.qa/design/${phase}/${slug}-${width}-${theme}.png`,
        });
      }
      expect(errors).toEqual([]);
    });
  }
  test(`all exported routes meet automated WCAG 2.2 AA checks in ${theme}`, async ({
    page,
  }) => {
    test.setTimeout(180000);
    await page.setViewportSize({
      width: theme === "light" ? 1440 : 375,
      height: 900,
    });
    await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
    const results = [];
    for (const path of routes) {
      await page.goto(path);
      const result = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
        .analyze();
      results.push({ path, violations: result.violations });
    }
    await mkdir(`.qa/design/${phase}`, { recursive: true });
    await writeFile(
      `.qa/design/${phase}/accessibility-${theme}.json`,
      JSON.stringify(results, null, 2),
    );
    expect(results.filter((r) => r.violations.length)).toEqual([]);
  });
}
