# Architecture

Better Intersections (`new-frontend/`) is a **Next.js 16 App Router** application. It is a
lift-and-shift of the original Vite + React Router SPA (`src/` at the repo root) into Next.js.

All pages are `'use client'` components — the app is functionally a client-side SPA running on
Next.js, not a server-rendered application. The data layer, external APIs, and business logic are
unchanged from the original.

---

## High-level components

```
Browser (Next.js client components)
  |
  |-- Supabase (Postgres)        measurements table, computed_node_properties cache table
  |-- OSM REST API               node position & ways lookups (api.openstreetmap.org)
  |-- Overpass API               traffic signal & council boundary queries (overpass-api.de)
  |-- Mapbox GL                  tile rendering (via react-map-gl)

Local developer machine
  |-- start-maintenance script   populates computed_node_properties cache in Supabase
        |-- OSM REST API         node position & ways per intersection
        |-- Overpass API         council boundary + traffic signal queries
        |-- Supabase service role  writes to computed_node_properties (bypasses RLS)
```

---

## Directory structure

```
new-frontend/
├── app/                          Next.js App Router pages
│   ├── layout.tsx                Root layout — imports global CSS, wraps in <Providers>
│   ├── providers.tsx             'use client' wrapper for HelmetProvider
│   ├── page.tsx                  / → map page (MapComponent + Suspense)
│   ├── about/
│   │   └── page.tsx              /about
│   ├── analysis/
│   │   ├── page.tsx              /analysis
│   │   ├── copy-text.tsx         Intro/notes text component used by analysis page
│   │   └── max-wait-component.tsx  Per-council max-wait stats component
│   ├── contribute-measurement/
│   │   ├── page.tsx              /contribute-measurement (no pre-filled nodeId)
│   │   └── [nodeId]/
│   │       └── page.tsx          /contribute-measurement/:nodeId (pre-fills the form)
│   └── intersection/
│       └── node/
│           └── [nodeId]/
│               └── page.tsx      /intersection/node/:nodeId
│
├── src/                          Shared application code
│   ├── api/
│   │   ├── db.ts                 Supabase queries (measurements + computed_node_properties)
│   │   ├── osm.ts                OSM REST API calls (node position, adjacent ways)
│   │   └── overpass.ts           Overpass API queries
│   ├── components/
│   │   ├── HeaderAndFooter.tsx   Layout wrapper used by most pages
│   │   ├── MapInfoBox.tsx        Floating info/nav box overlaid on the map
│   │   ├── IntersectionFilter.tsx  Cycle time range slider + display mode selector
│   │   ├── IntersectionCard.tsx  Popup card shown when a map marker is clicked
│   │   ├── AuthenticatedContributeMeasurementForm.tsx  Measurement submission form
│   │   ├── PasswordlessLogin.tsx Supabase magic-link login
│   │   ├── CsvExport.tsx         Download all data as CSV
│   │   ├── JsonExport.tsx        Download all data as JSON
│   │   ├── LoadingIndicator.tsx  Spinner shown while data loads
│   │   ├── MapMarkers.tsx        Map marker rendering helpers
│   │   ├── SignalTimer.tsx       Traffic light timer UI component
│   │   ├── modal.tsx             Generic modal using React portal
│   │   ├── form-components.tsx   Shared form input components
│   │   └── Observable/
│   │       └── PlotFigure.tsx    Observable Plot wrapper for analysis charts
│   ├── hooks/
│   │   └── useModal.tsx          Modal open/close state hook
│   ├── styles/
│   │   ├── map-page.style.tsx    Emotion styled components for the map page
│   │   └── modal.style.tsx       Emotion styled components for the modal
│   ├── utils/
│   │   ├── computed-node-properties.ts   Central cache-read/compute/write logic (shared with maintenance script)
│   │   ├── council-calculations.ts       Overpass-based council name assignment (maintenance only)
│   │   ├── intersection-computed-properties.ts  Pure functions: averages, names, classifications
│   │   ├── utils.ts                      getIntersections() orchestrator; marker colour logic
│   │   ├── supabase-client.ts            Supabase anon client singleton
│   │   ├── url-formatting.ts             GeoHack and Google StreetView URL helpers
│   │   └── IntersectionPropertyCalculations/
│   │       └── isNSWStateRoad.ts         NSW state road name lookup
│   ├── config.ts                 Supabase URL, anon key, Mapbox token (from env vars)
│   ├── types.ts                  All shared TypeScript interfaces
│   ├── App.css                   Global application styles
│   └── index.css                 Base/reset styles
│
├── docs/
│   └── architecture.md           This file
├── next.config.ts                Next.js config (Turbopack + Node.js polyfill aliases)
├── tsconfig.json
└── package.json
```

---

## Route mapping

| URL pattern | File | Notes |
|---|---|---|
| `/` | `app/page.tsx` | Map page. URL params `?lat=&lon=&zoom=` set initial viewport. |
| `/about` | `app/about/page.tsx` | About page with CSV/JSON export. |
| `/analysis` | `app/analysis/page.tsx` | Observable Plot charts of the dataset. |
| `/contribute-measurement` | `app/contribute-measurement/page.tsx` | Measurement form, no pre-fill. |
| `/contribute-measurement/:nodeId` | `app/contribute-measurement/[nodeId]/page.tsx` | Form pre-filled with a specific OSM node. |
| `/intersection/node/:nodeId` | `app/intersection/node/[nodeId]/page.tsx` | Detailed timing table for one intersection. |

---

## Client-side rendering approach

All pages carry `'use client'` at the top. Next.js still server-renders client components for the
initial HTML shell, but every page uses React hooks (`useState`, `useEffect`) and browser APIs, so
all meaningful content is rendered after hydration.

**Why no server components or server actions?** The original Vite SPA was a pure browser app and
the migration is intentionally a lift-and-shift. Server-side data fetching is a potential future
improvement.

**Map page and `useSearchParams`:** The map page reads `?lat`, `?lon`, and `?zoom` URL params to
set the initial map viewport. It uses `useSearchParams()` from `next/navigation` (rather than
`window.location.search` directly), which requires the component to be wrapped in `<Suspense>`.
The exported page component is a thin wrapper that provides that boundary:

```tsx
export default function Page() {
  return (
    <Suspense>
      <MapComponent />
    </Suspense>
  );
}
```

---

## Global providers (`app/providers.tsx`)

`@dr.pogodin/react-helmet` requires its `<HelmetProvider>` to wrap the component tree. Because
`HelmetProvider` is a React context provider that requires client-side state, it is wrapped in a
`'use client'` component (`app/providers.tsx`) and rendered inside `app/layout.tsx`:

```tsx
// app/layout.tsx (server component)
<Providers>{children}</Providers>

// app/providers.tsx ('use client')
<HelmetProvider>{children}</HelmetProvider>
```

---

## Node.js polyfills (Turbopack)

Some dependencies (`xml2js`, `@supabase/supabase-js`) expect Node.js built-in modules that are not
available in the browser bundle. `next.config.ts` maps these to browser-compatible packages via
Turbopack's `resolveAlias`:

```ts
turbopack: {
  resolveAlias: {
    buffer: "buffer",
    stream: "stream-browserify",
    events: "events",
    timers: "timers-browserify",
  },
},
```

---

## Database tables (Supabase / Postgres)

### `measurements`

The primary data store. Each row is one crowd-sourced timing observation of a pedestrian crossing.
Key columns:

| Column | Description |
|---|---|
| `osm_node_id` | OSM node ID of the crossing. Nullable — older measurements may lack this. |
| `green_light_duration` | Seconds the pedestrian light was green. |
| `flashing_red_light_duration` | Seconds the pedestrian light was flashing red. |
| `solid_red_light_duration` | Seconds the pedestrian light was solid red. |
| `latitude`, `longitude` | Coordinates stored at submission time (fetched from OSM). |
| `unprotected_crossing` | Whether cars can cross during the flashing red phase. |
| `updated_at` | Submission timestamp. |

Row Level Security is enabled. Anyone can `SELECT`; only authenticated users can `INSERT` their own
rows.

### `computed_node_properties`

A cache table keyed by `osm_node_id`. Each row stores properties that require external API calls to
compute — road lane counts, human-readable intersection names, council names, road classification,
etc. — so they don't need to be re-fetched from OSM on every page load.

This table is **write-protected by RLS**: only a service-role key can insert or update rows. It can
be wiped and fully rebuilt at any time by re-running the maintenance script.

Key columns:

| Column | Description |
|---|---|
| `human_name` | e.g. "George St at -33.8688,151.2093" |
| `council_name` | Sydney council the intersection falls within, from Overpass. |
| `num_road_lanes` | From the OSM `lanes` tag on the adjacent way. |
| `is_nsw_state_road` | Whether the crossing is on a NSW state road. |
| `osm_highway_classification` | OSM `highway` tag value of the main adjacent way. |
| `road_max_speed` | From the OSM `maxspeed` tag. |
| `average_cycle_time` etc. | Snapshot averages — overwritten by live values on read (see note). |

> **Note on stored averages:** The averages in `computed_node_properties` are always recomputed
> from live measurement data immediately after a cache hit. The stored values are effectively
> ignored at read time. This is a known TODO — the averages shouldn't need to be stored in this
> table at all.

---

## Page load data flow

When a user opens the map page, the following sequence runs inside `MapComponent`'s `useEffect`:

### Step 1 — Fetch all measurements from Supabase

`getIntersectionMeasurements()` (`src/api/db.ts`) pages through the `measurements` table in chunks
of 1000 rows, returning every row that has a non-null `osm_node_id`.

### Step 2 — Resolve node locations

For each measurement row, `getOsmNodePosition()` (`src/api/osm.ts`) resolves the lat/lon. It first
checks the `latitude`/`longitude` columns stored directly on each measurement row (common for
recently submitted measurements). If absent, it falls back to the OSM REST API.

### Step 3 — Group by intersection

Multiple measurements for the same OSM node are grouped into `IntersectionStats` objects, each
containing an array of `TrafficLightReport` records.

### Step 4 — Enrich with `computedNodeProperties`

`computedNodeProperties()` (`src/utils/computed-node-properties.ts`) is the central function that
enriches each intersection with road metadata. It is used by **both the frontend and the
maintenance script**.

1. Fetches the entire `computed_node_properties` table from Supabase in one query.
2. For each intersection:
   - **Cache hit:** reads road properties from the cache; recomputes averages from live data.
   - **Cache miss:** makes two OSM REST API calls per intersection (`GET /api/0.6/node/:id` and
     `GET /api/0.6/node/:id/ways`). In the browser, results are used in-memory but **not written
     back** (no service-role key). A **3-second delay** is inserted after each cache miss to avoid
     overloading the OSM API.
3. Sets enriched data into React state, rendering the map markers.

---

## On-load delay when intersections are not cached

If all intersections are cached, the page renders quickly: one Supabase query for measurements, one
for the cache, markers appear.

If any intersection is missing from the cache (e.g. a new submission since the last maintenance
run), the browser must call the OSM REST API sequentially for each missing node, with a 3-second
delay each:

```
N uncached intersections × 3 seconds minimum delay
```

The loading spinner is shown until `state.points` is populated.

---

## The maintenance script

The maintenance script lives in the **root project** (`src/local-maintenance-entrypoint.ts`), not
in `new-frontend/`. It pre-populates `computed_node_properties` so browser clients don't need to
call the OSM API at runtime. It requires a Supabase **service role key** to write to the
RLS-protected cache table.

```
SERVICE_ROLE_KEY=<key> npm run start-maintenance
```

What it does:
1. Fetches all measurements (`getIntersections()`).
2. Calls `computedNodeProperties(intersections, logProgress=true, serviceRoleSupabase)`.
3. For each uncached intersection: fetches OSM data, queries Overpass for council, computes and
   inserts all properties, waits 3 seconds before the next.

---

## External API summary

| API | Used by | Purpose | Rate limiting |
|---|---|---|---|
| `api.openstreetmap.org` | Browser (cache miss) + maintenance script | Node position, adjacent ways | 3s delay per request |
| `overpass-api.de` | Maintenance script | Council boundaries, traffic signal nodes | 3s delay between per-council queries |
| Supabase REST | Browser + maintenance script | Measurements and cache table | None explicit |
| Mapbox | Browser | Map tile rendering | Token-scoped |

---

## Key source files

| File | Role |
|---|---|
| `app/layout.tsx` | Root layout — global CSS, font, HelmetProvider |
| `app/providers.tsx` | `'use client'` HelmetProvider wrapper |
| `app/page.tsx` | Map page — Suspense boundary + MapComponent |
| `src/utils/computed-node-properties.ts` | Shared cache-read / compute / cache-write logic |
| `src/utils/council-calculations.ts` | Overpass-based council name assignment (maintenance only) |
| `src/api/db.ts` | Supabase queries |
| `src/api/osm.ts` | OSM REST API calls |
| `src/api/overpass.ts` | Overpass API queries |
| `src/utils/intersection-computed-properties.ts` | Pure functions: averages, names, classifications |
| `src/utils/utils.ts` | `getIntersections()` orchestrator; marker colour logic |
| `src/utils/supabase-client.ts` | Supabase anon client singleton |
| `src/config.ts` | Supabase URL, anon key, Mapbox token |
| `src/types.ts` | All shared TypeScript interfaces |
