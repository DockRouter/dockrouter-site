# Validation

2026-10-18, Windows, Node.js, actual Next.js static export.

- `npm ci`: successful, npm audit reported zero vulnerabilities.
- `npm run lint`: passed, no warnings.
- `npm run build`: passed; all application pages statically exported.
- `npm run typecheck`: passed.
- `npm test`: exercises installation selection, copy success/failure, search navigation, route simulation without remote calls, all six v1.2.0 download combinations, theme persistence and blocked storage, keyboard dismissal, automated WCAG AA, 360/390/768/1440/3840px layouts, reduced motion, OXOGNET drawing, internal routes and anchors, 404 and CNAME.

The first browser run found contrast failures on the TLS indicator and orange CTA. Both were corrected before publication. Browser screenshots were visually reviewed for the desktop, mobile and 4K layouts. Automated accessibility checks are not a full manual accessibility certification. Website tests do not run the Docker ingress engine or physical mobile devices.

Source facts: upstream README, go.mod and GitHub v1.2.0 release asset names. No invented traffic statistics, customers, benchmark numbers or testimonials are used.

Final local result: 18/18 browser tests passed, including automated WCAG AA on the home page in both themes and on documentation, downloads, brand and release pages. No runtime errors or page overflow were observed from 320px through 3840px.

## Brand correction

The owner-supplied DockRouter anchor/routing reference replaces the temporary mark. Shared vector geometry drives the website symbol, routing illustration, downloadable light/dark and stacked SVGs, favicon and social image. The wordmark uses navy Dock and orange Router; the hero uses the supplied Stop Configuring / Start Shipping slogan.

A rendered diagram containment assertion reproduced an oversized nested SVG (738.77px hub versus a 324.76px limit at 1440px). The hub now embeds the shared glyph directly in SVG coordinates; the same assertion passes across all six responsive sizes. Final local lint, build, typecheck and all 18 browser checks pass after the brand update.

## Hero redesign

Replaced the small skewed hub logo with a larger upright anchor and coordinated request/TLS/route animation. Added service selection, pause/resume and replay. Playwright clock tests exercise the complete sequence and paused timer; a separate test checks reduced-motion behavior. All 20 local browser tests passed, along with lint, static build and typecheck. Screenshots were reviewed at mobile, desktop and 3840x2160. The scene is a labeled illustration, not a live ingress connection.

## Fluid layout revision

The original rendered container measured 1536px at a 1920px viewport; the new layout contract test failed against the old export before the change. The final export measured:

| Viewport | Container | Side gutter | Root font |
| --- | --- | --- | --- |
| 375 | 335 | 20 | 16px |
| 768 | 716.80 | 25.59 | 16px |
| 1024 | 955.72 | 34.14 | 16px |
| 1440 | 1344 | 48 | 16px |
| 1920 | 1728 | 96 | 16px |
| 2560 | 1728 | 416 | 16px |

All six sizes passed container/header/footer alignment, viewport containment, prose/table separation, page overflow and runtime-error checks across home, docs index, configuration reference, downloads, brand and changelog pages. Screenshots were reviewed for all target sizes, including mobile CTA wrapping and wide footer/grid composition. The existing 320px and 3840px controls also pass. Final local lint, build, typecheck and 26/26 browser tests passed. Screenshots and exact measurements are retained in ignored `.qa/layout/`.

## Full-bleed hero network

2026-10-18: added an independent Canvas 2D route network behind the entire hero, retaining the foreground SVG route explorer and shared 1728px content shell. No dependency changes. Central configuration controls density, colors, interaction radii, speed, lifetimes and resource limits.

Final local lint, static build, typecheck and all **37/37** browser tests passed. Eleven new checks cover actual canvas redraws, local pointer trails, 24 successive taps (at most ten large ring strokes per frame), effect expiry, control exclusion, keyboard pause/resume, zero redraws while offscreen/hidden/unmounted, a static reduced-motion scene with live theme switching, runtime motion-preference changes, touch tap versus a native Chromium swipe, reduced idle frame count, and high-DPI 4K resize/raster bounds. The document-hidden case mocks the visibility API boundary; touch coverage uses Chromium emulation, not a physical phone.

Light/dark screenshots at 375, 1920 and 3840px were visually reviewed; the existing six-size layout matrix and automated WCAG AA checks also passed. Screenshots are retained under `.qa/network/` and `.qa/layout/`. Canvas pixels are limited to approximately five million, DPR to 2 (1.5 on mobile), and transient objects to five waves, 32 sparks and nine pointer trails. Frame data stays outside React; observers, listeners and the RAF loop are disposed on navigation.

## Site-wide SVG background

Replaced the hero-only Canvas implementation with one persistent `SiteBackground` in the shared root layout. The SVG covers the viewport while the user scrolls through all sections, the footer and documentation. It uses brand-colored routes, junctions, container outlines, request packets and shallow scroll parallax. Theme colors resolve in CSS even while paused. Pools are bounded to five waves, 30 sparks and eight trails; geometry uses 12 objects on mobile and at most 65 on 4K, with fewer than 450 SVG descendants. Pointer events pass through the layer; controls, copy and native touch swipes do not create bursts. Hidden documents/invisible layers suspend RAF, and offscreen geometry is culled. No graphics dependencies were added.

Local build, lint and typecheck passed. The expanded suite has 38 checks, including 12 SVG-specific cases for local versus distant pointer response, repeated click variants and expiry, fixed DOM count, global scroll coverage, pause persistence across client navigation, reduced motion, themes, visibility boundaries, idle pacing, resizing and Chromium touch gestures. A local full run passed 37 checks and exposed a timing race in the 375px layout measurement: button positions were read in separate frames while their shared entrance transform moved. The test now reads both positions in one DOM evaluation, preserving the original 1.5px alignment condition; its focused rerun passed. No layout assertion was weakened.

Home/features screenshots at 375, 1920 and 3840px in both themes, plus wide footer/documentation and click-wave views, are retained in `.qa/svg/` and were visually reviewed. The visibility API case is emulated, and touch checks use Chromium rather than physical devices. The SVG is decorative and contains no live Docker traffic.

The first SVG CI run passed 37 checks and caught an inappropriate minimum-FPS assumption in the idle probe. The probe now counts mutation records (observer callbacks may batch frames) and asserts continued idle drawing, the 30/60 FPS upper budgets and a lower idle workload than active input. It does not assume the host provides a particular minimum RAF cadence.

The stricter probe reproduced 62 active updates in a simulated second with 16ms RAF intervals. The renderer now carries a fractional frame budget and measures physics time separately, preserving the 30/60 ceilings without snapping every render to a multiple of the host's RAF interval. Visibility/pause transitions reset both timing accumulators.

Console-error coverage also reproduced Windows export prefetch 404s: Next.js emitted `__next.docs/$d$slug/__PAGE__.txt` while the client requested `__next.docs.$d$slug.__PAGE__.txt`. The export normalizer now adds dotted aliases for nested segment files, preserving the original files. The same browser checks cover those requests.

## Continuous foreground interaction layer

The reported straight-edge cuts were reproduced as occlusion: all effects were in the global z-index -1 SVG, behind opaque cards and panels. The network's quiet-center mask also reduced visual strength; pointer tracking already used document-level viewport coordinates, but the trail filter excluded headings, paragraphs and entire routing panels. Card overflow/isolation belongs to their local illustrations and is preserved.

Moved transient effects into an independent fixed SVG body child at z-index 45, without a readability or section mask. The ambient SVG retains its quiet mask. Added cursor light/streaks and eight pooled foreground junction responses; increased local pointer radius/displacement and wave impulses, keeping finite lifetimes, fixed pools and 30/60 frame budgets. Interaction coordinates use client positions without scroll offsets. Controls, selection drags and native touch scrolling remain excluded from bursts; text/card hover continues to render. Pause and reduced motion clear the foreground.

The new heading-hover regression failed on the old export because zero trails were drawn over text. Light/dark text and opaque-card variants pass on the split layers. New coverage also checks body-level stacking, absence of foreground masks, click/scroll coordinate stability, real text selection and link navigation. Screenshots are retained under `.qa/interaction/`.

Final local lint, static export and typecheck passed, followed by all **41/41** browser tests. The full run includes the six-size layout matrix, both themes, 4K and mobile SVG checks, bounded repeated effects, reduced motion, lifecycle/frame budgets and automated WCAG AA. Foreground screenshots over the routing card and across scrolled section boundaries were visually reviewed. Touch gestures use Chromium emulation; no physical-device performance claim is made.

## Organic pointer current and chained pulses

Nearby anchored shapes now follow depth-dependent orbital currents with distance falloff and eased return. A click schedules progressively weaker pulses through existing route neighbors, with up to three hops, eight desktop/four mobile relays and a two-second lifetime. Relays reuse the eight foreground responders, cannot spawn waves or SVG nodes, and preserve the existing opacity and 30/60 frame budgets.

New clock-driven browser coverage measures angular travel around a stationary pointer, limits movement between samples and checks a distant control. A second case observes delayed, weaker pulse peaks on successive neighbors, expiry and unchanged SVG node count. The first chain run exposed a reach limit that stopped before the second neighbor; the reach was corrected without changing these assertions. Orbital and chain screenshots were visually reviewed in `.qa/interaction/`.

Final local lint, typecheck and static export passed. The 43-case browser run passed 41 checks; two existing cases hit the 30-second test limit during screenshot/context teardown, with no failing layout assertion. An unchanged single-worker rerun passed both cases plus the two 1920px theme controls (4/4). The animation-specific checks, six responsive sizes, touch/reduced motion and automated contrast coverage all have passing results; the local full run is not recorded as 43/43.
