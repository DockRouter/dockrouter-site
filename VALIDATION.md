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
