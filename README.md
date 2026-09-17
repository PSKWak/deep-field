# Deep Field

An interactive 3D explorer for stars, galaxies, planets, and black holes, built with Next.js, React Three Fiber, and Tailwind CSS. Includes live NASA Astronomy Picture of the Day data, a real-orbital-mechanics solar system, a hands-on exoplanet-hunting lab built on real Kepler photometry, and a sky reconstruction for any date and place.

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
- `src/app/api/chat/route.ts` — server-side Groq proxy that keeps the key hidden
- `src/lib/nasa.ts` — NASA API client
- `src/lib/planets.ts` — real orbital/physical data (NASA planetary fact sheets) and time math

## Learn mode

### Exoplanet Lab

Real Kepler long-cadence photometry for three confirmed planets, sliced to a 12-day window: **Kepler-1 b** (a 1.4% transit — unmissable), **Kepler-2 b** (0.67%), and **Kepler-4 b** (0.073%, only ~10× the noise). You click where you think a planet crossed its star, then run a simplified [Box Least Squares](https://en.wikipedia.org/wiki/Box_least_squares) search — the same family of algorithm the Kepler and TESS pipelines use — and compare your guesses against both the real transits and the algorithm's.

The detector is deliberately not a neural network. It folds the light curve at every candidate period, duration and phase, and scores each by signal-to-noise; on Kepler-4 b it recovers a 3.217-day period against a published 3.214 days, from data the eye can barely read. The accompanying explainer covers where learned models *do* come in — NASA's CNN classifiers for vetting candidates, and the two planets AstroNet recovered that the pipeline had discarded.

Photometry is PDCSAP flux from the [MAST Kepler archive](https://archive.stsci.edu/missions/kepler/lightcurves/), normalized with a 2nd-order polynomial fit to the out-of-transit points to remove instrumental drift; the transits themselves are untouched. Transit parameters come from the [NASA Exoplanet Archive](https://exoplanetarchive.ipac.caltech.edu/) KOI cumulative table.

### Your Sky

Reconstructs the real sky for any date, time and location, and saves it as a PNG poster. Star positions come from the Yale [Bright Star Catalogue](https://vizier.cds.unistra.fr/viz-bin/cat/V/50) (576 stars to magnitude 4.1, via VizieR); the Sun, Moon and planets come from [astronomy-engine](https://github.com/cosinekitty/astronomy)'s full ephemeris. Times are resolved in the *place's* timezone with historical daylight-saving rules, not the browser's.

The projection is azimuthal equidistant — zenith at the centre, horizon at the rim, north up and east left, as if lying on your back looking up. Star coordinates are J2000 and are not precessed, which is under half a degree of drift across a human lifetime.

## Planets mode

Orbital periods, rotation periods, axial tilts, and moon counts are real (NASA planetary fact sheets). Distances and planet sizes are visually compressed to fit on screen — noted in the UI — but relative orbital speed and day/year length are physically grounded. Each planet's "local time" is derived from its real sidereal rotation period.

## Texture credits

Planet, Sun, and Saturn-ring textures in `public/textures/planets/` are from [Solar System Scope](https://www.solarsystemscope.com/textures/), based on NASA imagery and elevation data, licensed under [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/).
