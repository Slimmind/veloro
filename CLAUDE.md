# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check (tsc -b) then production build
npm run lint      # Run ESLint
npm run preview   # Serve the production build locally
```

No test runner is configured.

Required env var for routing: `VITE_ORS_API_KEY` (OpenRouteService API key).

## Architecture

The project follows **Feature-Sliced Design (FSD)**:

```
src/
  app/          - Root App component (top-level state orchestration)
  features/
    map/        - Map rendering, bike path overlays, route display
    search/     - Geocoding search UI and menu components
  entities/     - Data shapes (BikePath, SearchResult)
  shared/
    api/        - External API clients (nominatim, ors, overpass)
    config/     - Shared constants
    lib/        - Utility functions (debounce, getMod)
    ui/         - Reusable components (Button, BikeLegend)
  hooks/        - Global hooks (useUserGeolocation)
  icons/        - SVG icon components
```

**State flow in `App.tsx`:** Three hooks (`useUserGeolocation`, `useMapSearch`, `useRoute`) compose all app state and pass it down as props to `MainHeader` (search UI) and `MainMap` (map). No Redux/Zustand — local `useState` throughout, except bike path data which uses a hand-rolled `bikePathsStore` (module-level Map + subscriber pattern, compatible with `useSyncExternalStore`).

## Key Technical Details

**Dual map library setup:** Leaflet (`react-leaflet`) is the primary container/interaction layer. MapLibre GL (`maplibre-gl` + `@maplibre/maplibre-gl-leaflet`) is embedded inside Leaflet as a `VectorTileLayer` for vector tile rendering. The `VectorTileLayer` component exposes the underlying `MLMap` instance for direct MapLibre manipulation.

**External APIs (all OSM-based):**
- **Overpass API** — fetches bike paths (OSM cycleways) within the current viewport
- **Nominatim** — place search / geocoding
- **OpenRouteService** — cycling route directions
- **OpenFreeMap** — vector tile styles (`liberty`, `bright`)
- **ArcGIS World Imagery** — satellite raster layer

**PWA:** `vite-plugin-pwa` with `injectManifest` strategy; custom `src/sw.ts` service worker using Workbox.

**TypeScript:** Strict mode, `noUnusedLocals`, `noUnusedParameters`, `erasableSyntaxOnly`, `moduleResolution: "bundler"`.

## UI Component Pattern

`Button` component uses a `mod` prop (space-separated string) to compose CSS class modifiers via the `getMod` utility in `shared/lib`.

Menu/panel components (see `MainMenu`) follow this pattern:
- Accept `open: boolean` + `onToggle: () => void` props
- Render a `<Button>` trigger and a `<div className={`component-name ${open ? '' : 'hidden'}`}>` panel
- Have a co-located `.styles.css` file
