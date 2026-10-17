import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { docs } from "../src/lib/docs";

test("terminal switches protocols and copies the selected command", async ({
  page,
  context,
}) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto("/");
  await page.getByRole("tab", { name: "TCP tunnel" }).click();
  const panel = page.getByRole("tabpanel");
  await expect(panel).toContainText("wirerift tcp 5432");
  await panel.getByRole("button", { name: "Copy command" }).click();
  await expect
    .poll(() => page.evaluate(() => navigator.clipboard.readText()))
    .toContain("wirerift tcp 5432");
  await page.getByRole("tab", { name: "TCP tunnel" }).press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Serve files" })).toHaveAttribute(
    "aria-selected",
    "true",
  );
  await expect(panel).toContainText("wirerift serve ./dist");
});

test("clipboard failure leaves a readable recovery message", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "clipboard", {
      value: { writeText: () => Promise.reject(new Error("denied")) },
    }),
  );
  await page.goto("/");
  await page
    .getByRole("tabpanel")
    .getByRole("button", { name: "Copy command" })
    .click();
  await expect(page.getByRole("tabpanel").getByRole("status")).toHaveText(
    "Select and copy the code below.",
  );
});

test("search finds a document, handles no results, and navigates", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Search documentation" }).click();
  await page.getByPlaceholder("Search documentation…").fill("zzzz-missing");
  await expect(page.getByRole("dialog")).toContainText("No results");
  await page.getByPlaceholder("Search documentation…").fill("ACME");
  await page
    .getByRole("dialog")
    .getByRole("link", { name: /Run your own server/ })
    .click();
  await expect(page).toHaveURL(/\/docs\/server\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Run your own server",
  );
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("inspector changes response and replays without calling a server", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: /POST \/api\/preview/ }).click();
  await page.getByRole("button", { name: "Response", exact: true }).click();
  await expect(page.locator(".request-detail pre")).toContainText(
    '"created": true',
  );
  await page.getByRole("button", { name: "Replay request" }).click();
  await expect(
    page.locator(".inspector-bottom").getByRole("status"),
  ).toContainText("Demo replay 1 completed · 201 · no network request sent");
});

test("installation commands follow the selected platform", async ({ page }) => {
  await page.goto("/#quickstart");
  await page.getByRole("button", { name: "Windows", exact: true }).click();
  await expect(page.locator(".quickstart-code")).toContainText(
    "wirerift-windows-amd64.exe",
  );
  await expect(page.locator(".quickstart-code")).toContainText(
    ".\\wirerift.exe http 3000",
  );
});

test("download architecture cannot leak between platforms", async ({
  page,
}) => {
  await page.goto("/download/");
  await page.getByRole("button", { name: "Linux", exact: true }).click();
  await page.getByLabel("Processor architecture").selectOption("arm");
  await expect(
    page.getByRole("link", { name: /Download client/ }),
  ).toHaveAttribute("href", /wirerift-linux-arm$/);
  await page.getByRole("button", { name: "FreeBSD", exact: true }).click();
  await expect(page.getByLabel("Processor architecture")).toHaveValue("amd64");
  await expect(
    page.getByRole("link", { name: /Download server/ }),
  ).toHaveAttribute("href", /wirerift-server-freebsd-amd64$/);
  await page.getByRole("button", { name: "Windows", exact: true }).click();
  await expect(
    page.getByRole("link", { name: /Download client/ }),
  ).toHaveAttribute("href", /wirerift-windows-amd64\.exe$/);
});

for (const mode of ["light", "dark"] as const) {
  test(`theme ${mode} persists, keyboard dismiss restores focus, WCAG AA`, async ({
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
  });
}

test("system appearance follows device setting without persistent storage", async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new Error("blocked");
      },
    });
  });
  await page.emulateMedia({ colorScheme: "dark" });
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("html")).toHaveCSS("color-scheme", "light dark");
  await page.getByRole("button", { name: /Color theme:/ }).click();
  await page.getByRole("radio", { name: "Light", exact: true }).check();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light");
});

for (const width of [360, 390, 768, 1440, 3840]) {
  test(`responsive navigation, visible SVG and no page overflow at ${width}px`, async ({
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
      ).toBe(true);
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

test("reduced motion disables orbit animation and keeps content visible", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/");
  await expect(page.locator(".packet-trail")).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(
    page.getByRole("heading", { level: 2, name: /Every request/ }),
  ).toBeVisible();
});

test("all exported routes, internal links and anchors resolve", async ({
  page,
  request,
}) => {
  const paths = [
    "/",
    "/docs/",
    "/download/",
    "/changelog/",
    "/brand/",
    ...docs.map((doc) => `/docs/${doc.slug}/`),
  ];
  const checked = new Set<string>();
  for (const path of paths) {
    await page.goto(path);
    const hrefs = await page
      .locator('a[href^="/"]')
      .evaluateAll((nodes) => nodes.map((n) => n.getAttribute("href") || ""));
    for (const href of hrefs) {
      const [target, hash] = href.split("#");
      if (!checked.has(target)) {
        const response = await request.get(target || path);
        expect(response.status(), target).toBe(200);
        checked.add(target);
      }
      if (hash && (target === path || !target)) {
        expect(await page.locator(`[id="${hash}"]`).count(), href).toBe(1);
      }
    }
  }
  expect((await request.get("/does-not-exist/")).status()).toBe(404);
});
