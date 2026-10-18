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

The full-bleed Canvas 2D background is independent of the SVG illustration. `HeroBackground` mounts the network renderer in `src/lib/hero-network.ts`; `HERO_NETWORK` centralizes density, speed, radii, lifetimes, effect limits and theme palettes. Branching routes carry request packets, local pointer movement displaces nearby ports, and empty-space taps emit bounded, short-lived waves. Controls and copy are excluded from tap effects; touch scrolling uses passive events. The scene has its own keyboard-accessible pause control, a static reduced-motion view, a 30fps idle budget, and a capped raster (2× DPR, 1.5× on mobile, at most five million pixels). Visibility/intersection observers suspend the frame loop; unmount removes all listeners and observers. No graphics dependency was added.

`tests/hero-network.spec.ts` exercises drawing changes, pointer trails, 24 repeated taps, expiry, control exclusion, pause, offscreen suspension, the document visibility API boundary, navigation cleanup, dynamic reduced motion, theme changes, touch swipes, idle pacing and high-DPI resizing. Mobile/desktop/4K screenshots in both themes are saved under `.qa/network/`.

## Shared layout system

`src/app/layout-system.css` owns the site container and spacing tokens. The shell uses fluid gutters and a 1728px maximum while retaining the browser's default root font size. Header, content and footer share the same alignment. Prose is capped at 65ch; code, tables and visual panels can use the remaining width. Wide hero steps become a side rail, documentation and brand cards use three columns, and release cards use two columns.

`tests/layout.spec.ts` checks 375, 768, 1024, 1440, 1920 and 2560px across six page types. It verifies container alignment, width bounds, overflow, paragraph/table widths, card columns and mobile controls. Measurements and page/footer screenshots are stored under `.qa/layout/`. The test server uses a DockRouter-specific port, 47863, to avoid collisions with other local projects.
