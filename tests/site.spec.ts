import { mkdir } from "node:fs/promises";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { docs } from "../src/lib/docs";

test("installation selection copies the active command and supports keyboard tabs", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/#quickstart");
  await page.getByRole("tab", { name: "Docker Run", exact: true }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("docker run -d --name dockrouter");
  await panel.getByRole("button", { name: "Copy command" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("-v dockrouter-data:/data");
  await page
    .getByRole("tab", { name: "Docker Run", exact: true })
    .press("ArrowRight");
  await expect(
    page.getByRole("tab", { name: "Build from source" }),
  ).toHaveAttribute("aria-selected", "true");
  await expect(panel).toContainText("go build -o dockrouter");
});
test("clipboard refusal offers a readable fallback", async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  await page.goto("/#quickstart");
  await page
    .getByRole("tabpanel")
    .getByRole("button", { name: "Copy command" })
    .click();
  await expect(page.getByRole("tabpanel").getByRole("status")).toHaveText(
    "Select and copy the code below.",
  );
});
test("search handles no matches and navigates to the right guide", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search documentation" }).click();
  await page.getByPlaceholder("Search documentation…").fill("zzzz-missing");
  await expect(page.getByRole("dialog")).toContainText("No results");
  await page.getByPlaceholder("Search documentation…").fill("ACME");
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /Automatic TLS/ })
    .click();
  await expect(page).toHaveURL(/\/docs\/tls\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Automatic TLS",
  );
  await expect(page.getByRole("dialog")).not.toBeVisible();
});
test("route explorer follows the selected container without a backend request", async ({
  page,
}) => {
  const requests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("example.com")) requests.push(r.url());
  });
  await page.goto("/");
  await page
    .getByRole("button", { name: "api api.example.com", exact: true })
    .click();
  await expect(page.locator(".demo-labels")).toContainText('dr.port: "8080"');
  await expect(page.locator(".demo-request")).toContainText(
    "https://api.example.com/v1",
  );
  await page.getByRole("button", { name: "Send example request" }).click();
  await expect(page.locator(".demo-test").getByRole("status")).toHaveText(
    "200 OK · example request 1 routed to api",
  );
  expect(requests).toEqual([]);
});
test("hero request follows its selected route, pauses and replays", async ({
  page,
}) => {
  await page.clock.install();
  await page.goto("/");
  await page.clock.runFor(200);
  const hero = page.locator(".hero-routing");
  await expect(hero).toHaveAttribute("data-playing", "true");
  await page
    .getByRole("button", { name: "Route to Realtime", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Route to Realtime", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await expect(hero.locator(".hero-incoming")).toContainText("GET /socket");
  await page.clock.runFor(1200);
  await expect(hero.locator('[aria-current="step"]')).toContainText("Secure");
  await page.getByRole("button", { name: "Pause routing animation" }).click();
  await page.clock.runFor(10000);
  await expect(hero.locator('[aria-current="step"]')).toContainText("Secure");
  await page.getByRole("button", { name: "Play routing animation" }).click();
  await page.clock.runFor(1300);
  await expect(hero.locator('[aria-current="step"]')).toContainText("Match");
  await page.clock.runFor(1400);
  await expect(hero.locator(".hero-route-result")).toContainText("200 OK");
  await expect(hero.locator(".hero-route-result")).toContainText(
    "live.example.com",
  );
  await page.getByRole("button", { name: "Replay hero request" }).click();
  await expect(hero.locator('[aria-current="step"]')).toContainText("Receive");
});
test("hero respects reduced motion while keeping destination selection useful", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(
    page.getByRole("button", {
      name: "Animation disabled by reduced motion preference",
    }),
  ).toBeDisabled();
  await page
    .getByRole("button", { name: "Route to Web app", exact: true })
    .click();
  await expect(page.locator(".hero-route-result")).toContainText(
    "app.example.com",
  );
  await expect(page.locator(".hero-route-result")).toContainText("200 OK");
  await page.getByRole("button", { name: "Replay hero request" }).click();
  await expect(page.locator(".hero-routing")).toHaveAttribute(
    "data-playing",
    "false",
  );
});
test("all six downloads match the verified release matrix", async ({
  page,
}) => {
  await page.goto("/download/");
  for (const [label, os] of [
    ["Linux", "linux"],
    ["macOS", "darwin"],
    ["Windows", "windows"],
  ]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    for (const arch of ["amd64", "arm64"]) {
      await page.getByLabel("Processor architecture").selectOption(arch);
      await expect(
        page.getByRole("link", { name: /Download DockRouter/ }),
      ).toHaveAttribute(
        "href",
        `https://github.com/DockRouter/dockrouter/releases/download/v1.2.0/dockrouter_1.2.0_${os}_${arch}.${os === "windows" ? "zip" : "tar.gz"}`,
      );
    }
  }
});
for (const mode of ["light", "dark"] as const) {
  test(`appearance ${mode} persists, keyboard dismissal restores focus, WCAG AA`, async ({
    page,
  }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Color theme:/ }).click();
    await page
      .getByRole("radio", { name: new RegExp(`^${mode}$`, "i") })
      .check();
    await page
      .getByRole("radio", { name: new RegExp(`^${mode}$`, "i") })
      .press("Escape");
    await expect(
      page.getByRole("button", {
        name: new RegExp(`Color theme: ${mode}`, "i"),
      }),
    ).toBeFocused();
    await page.reload();
    await expect(page.locator("html")).toHaveAttribute("data-theme", mode);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(results.violations).toEqual([]);
    await mkdir(".qa", { recursive: true });
    await page.screenshot({ path: `.qa/desktop-${mode}.png`, fullPage: true });
  });
}
test("system appearance works with blocked persistent storage", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    }),
  );
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light dark");
  await page.getByRole("button", { name: /Color theme:/ }).click();
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});
for (const width of [320, 360, 390, 768, 1440, 3840]) {
  test(`navigation, SVG and layouts fit ${width}px with no runtime errors`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width === 3840 ? 2160 : 900 });
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    for (const path of ["/", "/docs/architecture/", "/download/", "/brand/"]) {
      await page.goto(path);
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        path,
      ).toBe(true);
      if (path === "/") {
        await expect(page.locator(".routing-drawing")).toBeVisible();
        const drawingBounds = await page
          .locator(".routing-drawing")
          .boundingBox();
        const hubBounds = await page.locator(".router-float").boundingBox();
        expect(hubBounds?.width).toBeLessThanOrEqual(
          (drawingBounds?.width ?? 0) * 0.5,
        );
        expect(
          await page
            .locator(".routing-drawing")
            .evaluate((el) => el.clientWidth),
        ).toBeGreaterThan(200);
        await mkdir(".qa", { recursive: true });
        if (width === 390)
          await page.screenshot({ path: ".qa/mobile-hero.png" });
        await page.screenshot({
          path: `.qa/home-${width}.png`,
          fullPage: width < 1000,
        });
        if (width === 390) {
          await page.getByRole("button", { name: /Color theme:/ }).click();
          await expect(
            page.getByRole("dialog", { name: "Appearance" }),
          ).toBeInViewport();
          await page.getByRole("radio", { name: "Dark", exact: true }).check();
          await page
            .getByRole("radio", { name: "Dark", exact: true })
            .press("Escape");
          await page.screenshot({
            path: ".qa/mobile-dark.png",
            fullPage: true,
          });
        }
      }
    }
    if (width < 981) {
      await page.getByRole("button", { name: "Open menu" }).click();
      await page
        .getByRole("navigation", { name: "Mobile navigation" })
        .getByRole("link", { name: "Documentation" })
        .click();
      await expect(page).toHaveURL(/\/docs\/getting-started\/$/);
    }
    expect(errors).toEqual([]);
  });
}
test("reduced motion keeps diagrams, content and studio mark visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".packet-trail").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  await page.locator(".studio-symbol").scrollIntoViewIfNeeded();
  await expect(page.locator(".studio-symbol path").first()).toHaveCSS(
    "stroke-dashoffset",
    "0px",
  );
  await expect(
    page.getByRole("heading", { name: /A route you can follow/ }),
  ).toBeVisible();
});
test("OXOGNET signature draws on entering the viewport", async ({ page }) => {
  await page.goto("/");
  await page.locator(".studio-symbol").scrollIntoViewIfNeeded();
  await expect(page.locator(".studio-symbol")).toHaveAttribute(
    "data-motion",
    "drawing",
  );
  await expect(page.locator(".studio-symbol path").last()).toHaveCSS(
    "stroke-dashoffset",
    "0px",
  );
  await expect(
    page.getByRole("link", { name: "Visit OXOGNET" }),
  ).toHaveAttribute("href", "https://oxog.net/");
  await page.screenshot({ path: ".qa/studio.png" });
});
test("documentation, downloads, brand and release pages meet automated WCAG AA checks", async ({
  page,
}) => {
  for (const path of [
    "/docs/",
    "/docs/configuration/",
    "/download/",
    "/brand/",
    "/changelog/",
  ]) {
    await page.goto(path);
    const result = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    expect(result.violations, path).toEqual([]);
  }
});
test("every exported page, internal link and anchor resolves", async ({
  page,
  request,
}) => {
  const paths = [
    "/",
    "/docs/",
    "/download/",
    "/changelog/",
    "/brand/",
    ...docs.map((d) => `/docs/${d.slug}/`),
  ];
  const checked = new Set<string>();
  for (const path of paths) {
    await page.goto(path);
    const hrefs = await page
      .locator('a[href^="/"], a[href^="#"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href") || ""));
    for (const href of hrefs) {
      const [target, hash] = href.split("#");
      if (!checked.has(target)) {
        expect((await request.get(target || path)).status(), target).toBe(200);
        checked.add(target);
      }
      if (hash && (target === path || !target))
        expect(await page.locator(`[id="${hash}"]`).count(), href).toBe(1);
    }
  }
  expect((await request.get("/does-not-exist/")).status()).toBe(404);
  expect(await (await request.get("/CNAME")).text()).toBe("dockrouter.com\n");
});
