# Design quality review — 2026-10-20

Baseline: `83001895ec2115c8c0dcbcb4ab40178f5460ea2e`. The checkout was clean. Scope includes the home page, documentation index and all nine topics, downloads, brand assets, changelog and the exported 404 page. Existing logos, blue/navy/orange palette, the shared 1728px shell and the OXOG SVG geometry/drawing loop are retained.

## Findings and changes

| Priority | Observed problem | Repair |
|---|---|---|
| High | Reduced-motion rendering produced React hydration error 418 in the new responsive matrix. The hero derived its first client markup from an OS preference unavailable to the static renderer. | Shared external-store motion hook with an identical server/first-client snapshot, followed by the real, live OS preference. CSS continues to respect reduced motion before hydration. |
| Medium | Escape removed the mobile menu without restoring keyboard focus. Menu state survived crossing into desktop layout. | Restore focus to the toggle; dismiss on desktop transition/outside clicks and other header actions. |
| Medium | Search footer escaped a 280px-high viewport; the appearance panel extended to approximately 319px. | Bounded flex search dialog, an independently scrollable results area, scroll lock while modal, and height-bounded theme/menu panels with safe-area allowance. |
| Medium | Documentation section indication was missing on deeper routes; short sticky sidebars could extend below the viewport. Configuration tables were incorrectly named “API endpoints.” | Section-level current-location state, bounded scrollable sidebar/TOC and table names derived from their real section headings. |
| Medium | Geist remained the default despite the requested font system. Several UI labels and code samples were unusually small, and terminal colors still used an unrelated green palette. | Self-hosted Space Grotesk/JetBrains Mono via `next/font/local`, central type sizes, larger navigation/metadata/code, navy terminal tokens and clearer copy feedback/focus. No new UI library. |
| Low | Changelog actions touched with no horizontal gap; platform choices could become cramped. | Reusable wrapping action row and wrapping platform controls. |

## Verification and evidence

- Four focused regression checks failed on the original export on their focus, current-location and viewport assertions. The corresponding four checks subsequently passed after the fixes (`.qa/design/before-proof.txt`, `.qa/design/after-proof.txt`).
- The expanded matrix checks six page templates at 320, 375, 390, 768, 1024, 1280, 1440, 1920 and 2560px, in both themes. A separate case exercises 719/720, 800/801, 900/901, 980/981, 1100/1101 and 1279/1280px. Screenshots are under `.qa/design/after/`.
- Automated WCAG 2.2 AA checks cover all fifteen exported routes in desktop light and mobile dark. Existing tests retain theme persistence, keyboard controls, search empty state, copy failure, six binary choices, route/hero interaction, reduced motion, pointer cleanup and touch emulation.
- Actual font/glyph use is checked through Chromium's platform-font inspection, including Turkish text. Variable font family names can include the named default, such as “Space Grotesk Light”; that remains the requested custom family, not a fallback. Source files also contain all Turkish glyphs.
- Local lint, typecheck and static export passed. Comprehensive local test attempts encountered host-wide out-of-memory errors and were interrupted; these are not recorded as full passes. Local concurrency is reduced to one worker. GitHub's full browser suite remains the publication gate.

GitHub run [39388710446](https://github.com/DockRouter/dockrouter-site/actions/runs/39388710446) passed **80/80** tests and deployed revision `f7c8a8d`. A final manual keyboard pass found the code focus outline clipped at its outer edges; it now draws inside the code frame. Added coverage also confirms static content/navigation without JavaScript and a 200% zoom-equivalent viewport (640x450 CSS pixels, DPR 2), including controls and keyboard table scrolling. This viewport emulates reflow and pixel density; it does not certify each browser's native zoom UI.

Desktop/mobile screenshots were visually reviewed for the hero, documentation/table layout, download picker, brand cards, changelog actions and footer. These checks do not certify a complete WCAG conformance audit, physical-device performance, native mobile keyboard behavior, or every browser's zoom implementation.
