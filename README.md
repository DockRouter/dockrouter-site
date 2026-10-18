# DockRouter website

The Next.js website for [dockrouter.com](https://dockrouter.com), published from [DockRouter/dockrouter-site](https://github.com/DockRouter/dockrouter-site) to GitHub Pages.

## Develop

Use Node.js 24 and npm:

```sh
npm ci
npm run dev -- --port 3018
```

## Check and preview

```sh
npm run lint
npm run build
npm run typecheck
npx playwright install chromium
npm test
node scripts/preview.mjs 3018
```

The tests use the actual static export, an isolated preview server on port 47863 and Chromium. They cover installation tabs and keyboard control, clipboard success and refusal, documentation search, route simulation, six release downloads, persistent appearance and blocked storage, automated WCAG AA, reduced motion, the animated OXOGNET signature, internal links, and 320/360/390/768/1440/3840px layouts. Screenshots are saved under ignored `.qa/`.

## Publish

Push to main. `.github/workflows/deploy.yml` runs lint, static export, typecheck and browser tests before deploying `out/` to GitHub Pages. Configure Pages to use GitHub Actions and set its custom domain to `dockrouter.com`. The DNS A records already point at GitHub Pages; domain settings are managed at the repository level. `public/CNAME` and the export also retain the canonical domain. Future website updates belong in this repository, independently of the Go engine repository.

## Content and assets

- Product information is based on the upstream [README](https://github.com/DockRouter/dockrouter), its Go module (Go 1.22), and v1.2.0 release assets, checked on 2026-10-18. Update `src/lib/site.ts` and verify the release matrix when changing versions.
- Nine documentation topics cover installation, routing, TLS, balancing, security, observability, architecture and configuration. The route explorer is a labeled local simulation. It does not contact a Docker host or run an ingress router.
- DockRouter SVG mark redrawn from the owner-supplied anchor and routing reference, outlined wordmark, favicon, stacked variants and social image live in `public/`. `npm run brand` regenerates them with Fontkit and Sharp. The outlined wordmark uses OFL-licensed Geist and needs no installed font when downloaded.
- The website foundation was adapted from the MIT-licensed WireRift website. The appearance picker and animated OXOGNET area were adapted from the MIT-licensed CobaltDB website as requested. Copyright notices are retained in `public/licenses/`.
- Geist and Geist Mono are bundled locally. Lucide provides interface icons. Third-party license notices are included in `public/licenses/`.

MIT licensed. Third-party marks retain their ownership.

## Hero routing scene

The hero uses the owner-supplied anchor upright at the center of an interactive SVG routing scene. Four synchronized stages show receive, TLS termination, route matching and forwarding. Destination buttons select the web/API/realtime example; pause and replay controls are keyboard accessible. Animation timers stop outside the viewport or in a hidden document. Reduced-motion mode shows a completed route while preserving destination selection. All displayed traffic is illustrative.

## Site-wide SVG background

`SiteBackground` lives in the root layout and persists across client navigation. Its viewport-sized SVG follows the user through every section, documentation page and footer; no full-document bitmap or repeated section backgrounds are created. `src/lib/site-background.ts` owns frame data and SVG mutations outside React. `BACKGROUND_CONFIG` centralizes density, speed, depth, interaction radii and lifetimes. Theme colors come from CSS tokens in `src/app/site-background.css`, so they update even while paused.

The scene uses branching routes, container outlines, junctions and request packets. A quiet SVG at z-index -1 retains its readability mask. A separate, unmasked interaction SVG at z-index 45 sits above content and navigation; both are fixed body children, so card overflow, isolation and opaque backgrounds cannot cut off the interaction layer. Both layers use `pointer-events: none`; native modal dialogs remain in the browser top layer.

Nearby ports follow a smooth orbital current within a 270px radius, with depth-dependent speeds and eased return to their anchors. Click waves relay through the existing route graph with delayed, progressively weaker pulses and curved links: at most eight shapes on desktop or four on mobile, three hops, and two seconds total. Relays cannot spawn further waves or SVG nodes. The foreground retains its soft cursor light, short streaks and low-opacity junctions. Fixed pools cap effects at five waves, 30 sparks and eight trails; mobile geometry and interaction radii are reduced. Document-level pointer listeners track viewport `clientX/clientY` over text, cards and section boundaries. Controls/links, text-selection drags and touch swipes do not create waves; ordinary text/card taps can. Scroll affects the ambient network's depth, while interaction origins remain in viewport coordinates.

A keyboard-accessible mouse button beside the header theme control switches only pointer interactions. Its English label/tooltip changes between "Disable mouse effects" and "Enable mouse effects", with a slashed icon when off. `dockrouter-motion` stores an explicit on/off choice; until a choice is made, the current system reduced-motion preference applies. The control remains usable if storage is blocked. Turning it off clears waves, trails, cursor light and orbital responses and removes the six pointer/blur listeners. Ambient shape drift, route packets and scroll depth continue at the idle frame budget, using only their visibility/scroll/resize lifecycle. The foreground receives no frame mutations while off. Reduced motion still makes the ambient field static, unless the user explicitly enables effects. Hero routing, navigation and other content interactions have independent controls.

Hidden documents and invisible layers suspend RAF, offscreen geometry is culled, and cleanup removes listeners and observers. No graphics dependency was added. `tests/motion-toggle.spec.ts` checks listener removal across repeated toggles, preference persistence/override, unavailable storage, cross-tab updates, keyboard operation, mobile hit targets and header alignment. `tests/interaction-layer.spec.ts` covers text/card visibility in both themes, stacking/mask/pointer-event contracts, scroll alignment, text selection and usable links. Screenshots are saved under `.qa/motion-toggle/` and `.qa/interaction/`.

`tests/site-background.spec.ts` covers local versus distant pointer response, 24 repeated taps, fixed DOM bounds, effect expiry, control exclusion, scrolling through the footer, navigation/pause persistence, visibility suspension, dynamic reduced motion and themes, and Chromium touch swipes. Light/dark screenshots at mobile, desktop and 4K widths are saved under `.qa/svg/`.

## Shared layout system

`src/app/layout-system.css` owns the site container and spacing tokens. The shell uses fluid gutters and a 1728px maximum while retaining the browser's default root font size. Header, content and footer share the same alignment. Prose is capped at 65ch; code, tables and visual panels can use the remaining width. Wide hero steps become a side rail, documentation and brand cards use three columns, and release cards use two columns.

`tests/layout.spec.ts` checks 375, 768, 1024, 1440, 1920 and 2560px across six page types. It verifies container alignment, width bounds, overflow, paragraph/table widths, card columns and mobile controls. Measurements and page/footer screenshots are stored under `.qa/layout/`. The test server uses a DockRouter-specific port, 47863, to avoid collisions with other local projects.
