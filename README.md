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

The tests use the actual static export, an isolated preview server on port 47861 and Chromium. They cover installation tabs and keyboard control, clipboard success and refusal, documentation search, route simulation, six release downloads, persistent appearance and blocked storage, automated WCAG AA, reduced motion, the animated OXOGNET signature, internal links, and 320/360/390/768/1440/3840px layouts. Screenshots are saved under ignored `.qa/`.

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
