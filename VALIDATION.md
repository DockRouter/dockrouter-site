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
