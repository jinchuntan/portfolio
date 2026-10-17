# Verification record · 17 October 2026

Implementation reviewed: `8ac116e473653b52478f2aaeb7c4b5d5b0c4c1a2` on `design/signals-to-impact`.
Pull request: https://github.com/jinchuntan/portfolio/pull/5.

## Local verification

- Clean `npm ci --include=dev --ignore-scripts` completed with the committed lockfile.
- `npm run check` confirmed all 14 generated HTML documents, sitemap and robots.txt match source, and JavaScript syntax is valid.
- `npm test` passed 8 tests covering the public package, internal links and asset graph, canonical/social/structured metadata, record preservation, menu behavior, the signal interaction and no-JavaScript foundations.
- `npm run build:site` completed and produced `dist/` using the existing Vercel build contract.
- `git diff --check` passed.
- Homepage copy is 339 words, counting visible document text with SVG labels excluded. Four selected projects and three recognition highlights are present.

## Browser and visual review

GitHub Actions runs Chromium against the same local `dist/` package, without any Vercel account or preview access. Review run: https://github.com/jinchuntan/portfolio/actions/runs/39023419808.

| View | Viewport | Input emulation |
| --- | --- | --- |
| Desktop | 1440 × 1000 | Mouse and keyboard |
| Tablet | 768 × 1024 | Mouse and keyboard |
| Mobile | 390 × 844 | Mobile and touch-capable context |
| Narrow mobile | 320 × 800 | Mobile and touch-capable context |

The suite checks all 13 content routes at each width for successful responses, loaded images, heading visibility, JavaScript errors and horizontal overflow. It checks the menu, Escape/focus restoration, current-location indicators, native back navigation, contact targets, keyboard skip navigation, visible focus, reduced motion and no-JavaScript navigation. Axe checks WCAG 2 A/AA and 2.1 AA tags on home, ConfoSense and Recognition at each width. Automated accessibility checks are bounded evidence, not a complete accessibility certification.

Screenshots cover the homepage, first screen, work collection, About, Recognition, ConfoSense and mobile menu. Visual review checked spacing, text wrapping, project differentiation, image loading and navigation clarity. The review caught and corrected a redundant desktop menu button. The APR visual is an actual public-renderer capture with every displayed identifier and numeric value fabricated for this portfolio. Its uncropped capture is retained with the source assets.

## Hosting and deployment boundaries

Vercel successfully built the reviewed branch using its existing integration. Deployment record: https://vercel.com/tan-jin-chuns-projects/portfolio/2NZiEMX4eAC9AyeVASpzfjtHUNMx.

The protected Vercel preview was not used for browser QA. No Vercel access settings, DNS, custom-domain assignment, CNAME or hosting audience were changed. The existing Vercel configuration and Pages workflow are retained.

All production metadata and documentation use https://tanjinchun.com. A branch deployment, PR merge and confirmation on the custom domain are separate events; the final task handoff reports their observed status. This record establishes the tested code and build evidence and does not infer a custom-domain deployment from a successful preview.

## Content verification limits

Supplied award names, dates, credentials and community records are retained from `data/profile.json`. Issuer validity was not independently revalidated. Public APR Dashboard and RoomLab documentation, the supplied engineering portfolio, Springwise’s project feature and the YSEH listing informed the case studies. No new publication acceptance or production deployment of a research prototype is asserted. Proprietary employer reports and chip results are excluded.
