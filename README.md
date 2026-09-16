# Deep Field

An interactive 3D explorer for stars, galaxies, and black holes, built with Next.js, React Three Fiber, and Tailwind CSS. Includes live NASA Astronomy Picture of the Day data.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## NASA API key (optional)

The app works out of the box using NASA's public `DEMO_KEY`, which is rate-limited. For a higher rate limit, get a free key at [api.nasa.gov](https://api.nasa.gov) and set it:

```bash
cp .env.example .env.local
# edit .env.local and set NEXT_PUBLIC_NASA_API_KEY
```

## Deploying to Vercel

1. Push this repo to GitHub.
2. Import it at [vercel.com/new](https://vercel.com/new).
3. (Optional) add `NEXT_PUBLIC_NASA_API_KEY` as an environment variable in the Vercel project settings.
4. Deploy — no other configuration needed.

## Project structure

- `src/components/DeepField.tsx` — top-level scene, mode switcher, layout
- `src/components/scenes/` — the three 3D scenes (Stars, Galaxies, Black Holes)
- `src/components/ControlPanel.tsx` — per-mode sliders
- `src/components/ApodPanel.tsx` — NASA Astronomy Picture of the Day panel
- `src/lib/nasa.ts` — NASA API client
