# Deep Field

**[Open the live app →](https://deep-field-blue.vercel.app/)**

An interactive 3D space explorer that runs on real astronomical data rather than decoration. Built with Next.js, React Three Fiber and Tailwind CSS.

Five modes:

- **Stars** and **Galaxies** — procedural fields you can tune: star count and colour temperature, spiral arm count and how tightly they wind.
- **Planets** — the solar system with real orbital periods, rotation periods, axial tilts and moon counts from NASA fact sheets. Click a planet to fly to it; jump to any date and watch the system advance correctly. Distances and sizes are compressed to fit on screen, which the UI says plainly.
- **Black Holes** — four real classes from stellar-mass to supermassive, with the actual Event Horizon Telescope photographs of M87\* and Sagittarius A\*, a labelled anatomy overlay that appears as you zoom in, a gravity sandbox where dropped particles orbit, spiral in or escape, and NASA's Perseus cluster sonification — real pressure waves shifted 57 octaves into hearing range.
- **Learn** — two hands-on pieces:
  - **Exoplanet Lab** — genuine Kepler photometry for three confirmed planets. Click where you think a planet crossed its star, then run a Box Least Squares search and see how you did against both the real transits and the algorithm. On the hardest target it recovers a 3.217-day period against 3.214 published, from data the eye can barely read.
  - **Your Sky** — the real sky over any city on any date, from a 576-star catalogue plus full planetary ephemerides, saveable as a PNG poster.

An **AI guide** is reachable from every mode and knows which scene you are looking at and where the sliders are set, so "why does the disk glow orange" gets an answer about the disk in front of you.

Separately, [`ml/`](ml/) holds a Python classifier trained on 7,587 human verdicts from the Kepler Objects of Interest catalogue — the learned counterpart to the app's physics-based search.

Where the visualisation is simplified or not to scale, the app says so rather than letting the picture imply otherwise.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## API keys (both optional)

```bash
cp .env.example .env.local
```

- **`NEXT_PUBLIC_NASA_API_KEY`** — for the Astronomy Picture of the Day panel. Defaults to NASA's public `DEMO_KEY`, which is heavily rate-limited and will start returning 429s after a handful of loads. A free key from [api.nasa.gov](https://api.nasa.gov) fixes that. Safe to expose client-side: it's a rate limit, not a secret.
- **`GROQ_API_KEY`** — for the "Ask the guide" AI panel. Free key from [console.groq.com](https://console.groq.com). **Server-side only** — it is read in a Route Handler and never reaches the browser, which is why it has no `NEXT_PUBLIC_` prefix. Without it the rest of the app works normally and the chat panel says it isn't configured.

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. (Optional) add `NEXT_PUBLIC_NASA_API_KEY` and `GROQ_API_KEY` as environment variables in the Vercel project settings.
4. Deploy — no other configuration needed. The AI chat runs as a Next.js Route Handler, so there is no separate backend to host.

## Project structure

- `src/components/DeepField.tsx` — top-level scene, mode switcher, layout
- `src/components/scenes/` — the 3D scenes (Stars, Galaxies, Planets, Black Holes)
- `src/components/ControlPanel.tsx` — per-mode sliders
- `src/components/ApodPanel.tsx` — NASA Astronomy Picture of the Day panel
- `src/components/PlanetInfoPanel.tsx` — real facts + live local time for a selected planet
- `src/components/LearnPanel.tsx` — the Learn mode, hosting the two panels below
- `src/components/ExoplanetLabPanel.tsx` + `LightCurveChart.tsx` — the transit-hunting game
- `src/components/BirthSkyPanel.tsx` + `BirthSkyCanvas.tsx` — the sky reconstruction
- `src/components/ChatPanel.tsx` — the AI guide, available in every mode
- `src/components/CitySearch.tsx` — city typeahead, backed by `src/lib/geocode.ts`
- `src/components/ModeHint.tsx` — the per-mode "?" explainer
- `src/components/ShareButton.tsx` — copies a link to the current view
- `src/lib/shareState.ts` — encodes/decodes the view into the URL hash
- `src/app/api/chat/route.ts` — server-side Groq proxy that keeps the key hidden
- `src/lib/nasa.ts` — NASA API client
- `src/lib/planets.ts` — real orbital/physical data (NASA planetary fact sheets) and time math
- `ml/` — Python: the trained planet/false-positive classifier (not part of the web app)

## Sharing a view

Mode, slider values, black-hole type, and the simulated date are encoded into the URL hash as you explore, so a reload or bookmark restores the same scene. **Share view** copies that link. Unknown or out-of-range values in a hand-edited link fall back to defaults rather than breaking the page.

## Learn mode

### Exoplanet Lab

Real Kepler long-cadence photometry for three confirmed planets, sliced to a 12-day window: **Kepler-1 b** (a 1.4% transit — unmissable), **Kepler-2 b** (0.67%), and **Kepler-4 b** (0.073%, only ~10× the noise). You click where you think a planet crossed its star, then run a simplified [Box Least Squares](https://en.wikipedia.org/wiki/Box_least_squares) search — the same family of algorithm the Kepler and TESS pipelines use — and compare your guesses against both the real transits and the algorithm's.

The detector is deliberately not a neural network. It folds the light curve at every candidate period, duration and phase, and scores each by signal-to-noise; on Kepler-4 b it recovers a 3.217-day period against a published 3.214 days, from data the eye can barely read. The accompanying explainer covers where learned models *do* come in — NASA's CNN classifiers for vetting candidates, and the two planets AstroNet recovered that the pipeline had discarded.

That learned half is implemented in Python under [`ml/`](ml/) — a classifier trained on 7,587 human verdicts from the Kepler Objects of Interest catalogue, which separates real planets from false positives at 0.978 ROC-AUC. See [ml/README.md](ml/README.md); it also demonstrates label leakage, since the KOI table ships four columns that encode the answer.

Photometry is PDCSAP flux from the [MAST Kepler archive](https://archive.stsci.edu/missions/kepler/lightcurves/), normalized with a 2nd-order polynomial fit to the out-of-transit points to remove instrumental drift; the transits themselves are untouched. Transit parameters come from the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) KOI cumulative table.

### Your Sky

"What the Universe looked like when a star like you was born" — reconstructs the real sky for any birth date, time and city, and saves it as a PNG poster. Reachable from the Learn tab or straight from Stars mode.

Star positions come from the Yale [Bright Star Catalogue](https://vizier.cds.unistra.fr/viz-bin/cat/V/50) (576 stars to magnitude 4.1, via VizieR); the Sun, Moon and planets come from [astronomy-engine](https://github.com/cosinekitty/astronomy)'s full ephemeris. City lookup uses [Open-Meteo's geocoding API](https://open-meteo.com/en/docs/geocoding-api) (free, no key), which returns the IANA timezone alongside the coordinates — so times are resolved in the *place's* own zone with historical daylight-saving rules, not the browser's.

The projection is azimuthal equidistant — zenith at the centre, horizon at the rim, north up and east left, as if lying on your back looking up. Star coordinates are J2000 and are not precessed, which is under half a degree of drift across a human lifetime.

## Planets mode

Orbital periods, rotation periods, axial tilts, and moon counts are real (NASA planetary fact sheets). Distances and planet sizes are visually compressed to fit on screen — noted in the UI — but relative orbital speed and day/year length are physically grounded. Each planet's "local time" is derived from its real sidereal rotation period.

## Texture credits

Planet, Sun, and Saturn-ring textures in `public/textures/planets/` are from [Solar System Scope](https://www.solarsystemscope.com/textures/), based on NASA imagery and elevation data, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
