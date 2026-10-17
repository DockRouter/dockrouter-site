# Validation

Verified on 2026-10-17 using Node.js 24.13.0 on Windows. The directory was initially empty; all tracked website files belong to this implementation.

## Local result

- `npm run format` — 30 source/config/test files checked; no remaining diagnostics.
- `npm run build` — Next.js 16.4.2 production export succeeded; 22 generated entries, including the 404, sitemap and robots assets.
- `npm run typecheck` — passed.
- `npm test` — 16 Chromium tests passed; zero skips or retries.
- Manual browser review — homepage on desktop, 390px mobile, and dark appearance at 3840×2160. SVG shapes remain vectors, with explicit reduced-motion fallbacks.

The suite exercises selected commands and clipboard success/failure, search results and empty results, inspector selection/replay, platform and CPU download mapping, persistent themes and blocked storage, keyboard dismissal, automated WCAG A/AA checks in both appearances, reduced motion, 360/390/768/1440/3840px overflow checks across four page types, every document route, internal links and the 404 response.

## Evidence boundary

These checks exercise the exported website in a browser. They do not launch the WireRift client/server or certify behavior on physical mobile devices. The inspector is an explicitly labeled local demonstration; replay does not send a network request. Automated accessibility checks are supplemented by keyboard and visual review, but are not a full manual accessibility certification.

Product content was checked against WireRift's current upstream README, Go module, Docker Compose file, brand reference and v1.7.0 release assets. Site preview and tunnel service domains are separate; example tunnel URLs are not advertised as a hosted service.

## Deployment

The GitHub Actions workflow runs lint, build, type check and the same 16 browser tests before deploying `out/`. The live workflow result and custom-domain HTTPS status are verified separately after publication.
