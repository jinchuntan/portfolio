# Nigel Tan · Engineering fieldbook

Personal portfolio for Nigel Tan (Tan Jin Chun), physical design engineer in Kuala Lumpur. Production: https://tanjinchun.me/

The portfolio connects semiconductor engineering, applied computing research, software prototypes, sustainable energy, and community work through an original editorial design. The reference portfolio informed the ambition, not the source code or visual identity.

## Local development

Use Node.js 24 and install the development-only test dependency.

```sh
npm ci
npm run build
npm run check
npm test
npm run build:site
```

Serve `dist/` with a local static server. The page uses ES modules, so use HTTP rather than opening `index.html` through `file://`. No application backend, account, API key, analytics, or runtime data request is needed. Google Fonts is optional; system font fallbacks are provided.

## What visitors can do

- Switch between engineering, research, and community interests in the chip illustration.
- Filter eight featured projects and open their question, approach, outcome, and implementation limits.
- Adjust an interval around a synthetic signal and optionally add sensor drift.
- Search awards, learning entries, and community roles, with independent category filters.
- Open portfolio search with the header button, `/`, or Ctrl/Cmd+K. Results reveal their parent section and clear conflicting filters.
- Copy the contact email, use direct social/contact links, or print the current profile.

The full content is present in the generated HTML. JavaScript adds controls; native disclosures and links still work without it. Reduced-motion preferences are respected. There is no blocking loading screen.

## Edit the profile

- `data/profile.json` is the structured source for experience, education, projects, awards, community roles, and credentials.
- `src/template.html` contains the page narrative, section layout, and metadata.
- `scripts/build.mjs` safely escapes profile text and generates `index.html`.
- `script.js` implements progressive enhancement. `lib/search.mjs` and `lib/uncertainty.mjs` contain reusable, tested logic.
- `style.css` and `mediaqueries.css` define the visual system, responsive layouts, print styles, and motion preferences.
- `assets/social-card.svg` is the editable share-image source; `social-card.png` is the 1200×630 crawler asset. The original portrait remains preserved; `portrait.webp` is its optimized display copy.

After changing data or the template, run `npm run build` and commit the updated `index.html` too. `npm run check` rejects stale HTML. If the production domain changes, update the canonical/social URLs, structured data, sitemap, and robots file together.

Issue dates are retained as provided rather than converted into drifting duration labels. Certifications, course certificates, specializations, and registrations retain their supplied titles; a listed issue date does not establish current certification validity. Unknown dates are not guessed. Company names and roles are textual references, not endorsements.

## Research and prototype boundaries

The uncertainty notebook uses a deterministic synthetic temperature series. Its interval slider controls a fixed half-width; it does not calibrate a conformal predictor, establish nominal coverage, or reproduce dissertation results. Orange points simply mark observations outside that illustrative interval. Actual research is linked to ConfoSense's evidence index.

Project case notes distinguish working prototypes from future integrations. Quipus sample conversations are fictional, RoomLab's hardware alignment adapters are mocked, and GotongFlow's proof hashes are demonstrations. No proprietary employer chip data is published.

## Deployment

`npm run build:site` regenerates the HTML and packages an explicit public allowlist into `dist/`. It preserves all legacy asset/PDF paths while excluding repository metadata, tests, profile source, templates, and `node_modules`.

- **GitHub Pages:** `.github/workflows/static.yml` validates and packages on pushes to `main` before deploying `dist/` to the existing Pages environment and custom domain.
- **Vercel:** `vercel.json` retains the framework-free setup, installs the lockfile, builds the static package, and serves `dist/`.
- **PR checks:** `.github/workflows/validate.yml` runs freshness checks, automated tests, and packaging.

## Verification

The Node test suite uses linkedom to check the generated document and real event handlers, including category/query combinations, hidden-result recovery, literal and accent-insensitive search, clipboard failure, illustration controls, and print-state restoration. It also validates local links and asset paths.

DOM tests do not establish visual layout, native dialog focus behavior, or browser-specific print rendering. Browser visual QA was unavailable in the managed authoring workspace. Review the live page at phone and desktop widths when making visual changes.
