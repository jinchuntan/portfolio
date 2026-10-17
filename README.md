# Nigel Tan · Signals to impact

Personal portfolio for Nigel Tan (Tan Jin Chun). Canonical production origin: https://tanjinchun.com/.

A concise homepage introduces semiconductor engineering, applied AI research and community leadership. Eight projects have dedicated case studies; career, education, awards, credentials and volunteering live on separate pages.

## Develop and validate

Use Node.js 24.

```sh
npm ci
npm run build
npm run check
npm test
npm run build:site
```

The PR workflow also runs Chromium at 1440, 768, 390 and 320 px, checks keyboard and mobile navigation, image loading, overflow, no-JavaScript behavior, reduced motion and axe accessibility rules, and uploads screenshots. Run it locally on a browser-capable host with `npx playwright install chromium` and `npm run test:browser` after packaging. Browser checks use the local `dist/` build and need no Vercel credentials.

Serve `dist/` with an ordinary static HTTP server. There are no runtime dependencies, API keys, analytics requests or external font requests. JavaScript progressively enhances native links with a mobile menu, current-section indicator and optional signal interaction. Reduced motion is respected. Pages and navigation remain usable without JavaScript.

## Content and source

- `data/profile.json`: supplied projects and professional record.
- `src/template.html`, `scripts/build.mjs`: shared document shell and deterministic page generation. Run the build after edits; commit generated HTML, sitemap and robots.txt.
- `script.js`, `style.css`, `mediaqueries.css`: responsive interface and progressive enhancement.
- `scripts/project-media.mjs`: original SVG project illustrations; run with Node to regenerate them.
- `assets/projects/`: distinct project visuals. The dashboard screenshot uses invented values in the real public renderer. Other project diagrams explicitly identify illustration scope.
- `docs/DESIGN.md`: pre-implementation structure, design principles and content boundaries.
- `docs/VERIFICATION.md`: verification results and deployment distinction.

Existing PDF and asset URLs are preserved. `scripts/package.mjs` copies an explicit public allowlist to `dist/`, excluding development files and source profile data.

## Hosting and domain

The existing repository has both a Vercel integration and a GitHub Pages workflow. `vercel.json` remains the hosting build contract: `npm ci --include=dev`, `npm run build:site`, output `dist/`. The Pages workflow validates and deploys the same public output on main pushes.

Canonical links, Open Graph URLs, social images, Person structured data, sitemap, robots.txt and documentation consistently use **https://tanjinchun.com**. There is no committed CNAME or local Vercel project-domain binding. This redesign does not change DNS, Vercel domain assignments, audience or account settings.

The multi-page site assumes root hosting at the custom domain. For a repository-subpath Pages URL, configure an asset/route base before treating that URL as a production alternative.

A branch commit, open pull request, merged commit, successful Vercel deployment and verified custom-domain response are separate states. A green build or merged PR alone does not prove that https://tanjinchun.com serves the new version. Verify the deployed page and assets on that exact domain before calling it live.
