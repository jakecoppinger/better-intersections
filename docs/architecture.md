# Architecture

Better Intersections is a statically-built TypeScript/React single-page application deployed on
Cloudflare Pages. There is no server-side application layer — all logic runs in the browser or in
the local maintenance script.

---

## High-level components

```
Browser (React SPA)
  |
  |-- Supabase (Postgres)        measurements table, computed_node_properties cache table
  |-- OSM REST API               node position & ways lookups (api.openstreetmap.org)
  |-- Overpass API               traffic signal & council boundary queries (overpass-api.de)
  |-- Mapbox GL                  tile rendering

Local developer machine
  |-- start-maintenance script   populates computed_node_properties cache in Supabase
        |-- OSM REST API         node position & ways per intersection
        |-- Overpass API         council boundary + traffic signal queries
        |-- Supabase service role  writes to computed_node_properties (bypasses RLS)
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

This table is **write-protected by RLS**: only a service-role key can insert or update rows. The
table can be wiped and fully rebuilt at any time by re-running the maintenance script.

Key columns beyond the primary key:

| Column | Description |
|---|---|
| `human_name` | e.g. "George St at -33.8688,151.2093" — derived from OSM way names. |
| `council_name` | Sydney council the intersection falls within, from Overpass. |
| `num_road_lanes` | From the OSM `lanes` tag on the adjacent way. |
| `is_nsw_state_road` | Whether the crossing is on a NSW state road. |
| `osm_highway_classification` | OSM `highway` tag value of the main adjacent way. |
| `road_max_speed` | From the OSM `maxspeed` tag. |
| `average_cycle_time` etc. | **Snapshot averages stored at cache-write time** (see note below). |

> **Note on stored averages:** The averages (`average_cycle_time`, `average_green_duration`, etc.)
> are stored in `computed_node_properties` but are **always recomputed from live measurement data**
> when the cache is read. The stored values are overwritten in-memory by freshly calculated averages
> immediately after a cache hit. This is acknowledged as a TODO in the code — the averages
> shouldn't need to be stored in this table at all.

---

## Page load data flow

When a user opens the map page, the following sequence runs inside `MapComponent`'s `useEffect`:

### Step 1 — Fetch all measurements from Supabase

`getIntersectionMeasurements()` (`src/api/db.ts`) pages through the `measurements` table in chunks
of 1000 rows, returning every row that has a non-null `osm_node_id`. This is a single (or few)
Supabase queries.

### Step 2 — Resolve node locations

For each measurement row, `getOsmNodePosition()` (`src/api/osm.ts`) resolves the lat/lon of its
OSM node. It first checks an in-memory lookup built from the `latitude`/`longitude` columns stored
directly on each measurement row. If the coordinate is present there (the common case for recently
submitted measurements), no external API call is needed. If it is absent, it falls back to the OSM
REST API (`api.openstreetmap.org/api/0.6/node/:id`).

### Step 3 — Group by intersection

Multiple measurements for the same OSM node are grouped into `IntersectionStats` objects, each
containing an array of `TrafficLightReport` records.

### Step 4 — Fetch/compute enriched properties (`computedNodeProperties`)

`computedNodeProperties()` (`src/utils/computed-node-properties.ts`) is the central function that
enriches each intersection with road metadata. It is used by **both the frontend and the
maintenance script** to keep the logic in sync.

The function:

1. Fetches the entire `computed_node_properties` table from Supabase in one query, building an
   in-memory map keyed by `osm_node_id`.
2. Iterates over every intersection:
   - **Cache hit:** reads road properties (lanes, name, council, etc.) from the cache. Averages are
     recomputed from the live measurement data regardless.
   - **Cache miss:** makes two OSM REST API calls per intersection —
     `GET /api/0.6/node/:id` (position) and `GET /api/0.6/node/:id/ways` (adjacent ways) — then
     computes all properties from the returned data. **When running in the browser, the computed
     properties are used immediately but are NOT written back to the database** (no service-role
     key). The next maintenance script run is required to persist them.
3. The final array of enriched intersections is set into React state, which causes the map markers
   to render.

---

## On-load delay when intersections are not cached

If every intersection is cached in `computed_node_properties`, the page renders quickly: one
Supabase query for measurements, one for the cache, then markers appear.

If any intersection is missing from the cache (e.g. a new measurement has been submitted since the
last maintenance run), the browser must call the OSM REST API **sequentially** for each missing
node:

- Two HTTP requests per uncached intersection (node position + ways).
- A **3-second delay** is inserted after each cache miss (`computed-node-properties.ts:147–149`).

With N uncached intersections the minimum additional delay is:

```
N * 3 seconds
```

This means that if the maintenance script has not been run recently and several new intersections
have been added, the map can take tens of seconds to finish loading. The loading spinner
(`LoadingIndicator`) is shown until `state.points` is populated.

---

## The maintenance script

### Purpose

The maintenance script pre-populates `computed_node_properties` so that browser clients don't need
to call the OSM API at runtime. It must be run locally by a developer with access to the Supabase
**service role key**, because RLS prevents the browser (using the anon key) from writing to the
cache table.

### How to run

```
SERVICE_ROLE_KEY=<your-service-role-key> npm run start-maintenance
```

The `start-maintenance` npm script runs `src/local-maintenance-entrypoint.ts` via `tsx`.

### What it does

1. Calls `getIntersections()` — fetches all measurements from Supabase, resolves node positions,
   groups by intersection.
2. Calls `computedNodeProperties(intersections, logProgress=true, serviceRoleSupabase)` — the same
   shared function used by the frontend, but with a service-role Supabase client passed in.
3. For each intersection **not** already in the cache:
   a. Fetches OSM node position and adjacent ways from `api.openstreetmap.org`.
   b. Queries Overpass for council boundary data (see below).
   c. Computes all `ComputedNodeProperties` fields.
   d. Inserts the result into `computed_node_properties` using the service-role client, bypassing
      RLS.
   e. **Waits 3 seconds** before processing the next uncached intersection, to avoid overwhelming
      the OSM API.

Intersections already present in the cache are skipped entirely.

### When to run it

- After any batch of new measurements that introduce previously-unseen OSM node IDs.
- Periodically to keep road metadata (lane counts, names, classifications) up to date with OSM
  edits.
- The script is currently a manual, developer-initiated step — there is no automated scheduling.

---

## Overpass API usage and load

The Overpass API (`overpass-api.de/api/interpreter`) is used in two places:

### 1. Map page: nearby crossings query (not on main load path)

`getOSMCrossings()` (`src/api/overpass.ts`) queries for signalised crossings near a given location.
This is used by specific pages (e.g. the contribute-measurement page to suggest nearby OSM nodes),
not by the main map load.

### 2. Maintenance script: council name assignment

`generateSignalNodeIdToCouncilNameMap()` (`src/utils/council-calculations.ts`) assigns each
intersection a council name. It is **only called during the maintenance script** (not in the
browser). The algorithm:

1. One Overpass query to fetch all admin-level-6 relations (LGA councils) within the Sydney OSM
   relation (`rel/5750005`). This returns ~30+ council relations.
2. For **each council**, one Overpass query to fetch all `crossing=traffic_signals` nodes within
   that council's boundary area.
3. Each of our measured intersections is checked against each council's node set to find a match.
4. A **3-second delay** is inserted between each per-council query.

With ~30 Sydney councils, this adds at minimum **90+ seconds** to the maintenance script runtime,
plus query execution time. The total maintenance script runtime for a full rebuild can be several
minutes.

Both Overpass functions use `overpassTurboRequestWithRetries()` with 3 retries before failing.

---

## External API summary

| API | Used by | Purpose | Rate limiting |
|---|---|---|---|
| `api.openstreetmap.org` | Browser (cache miss) + maintenance script | Node position, adjacent ways | 3s delay per request in maintenance script; no delay in browser |
| `overpass-api.de` | Maintenance script (council calc) | Council boundaries, traffic signal nodes within area | 3s delay between per-council queries |
| Supabase REST | Browser + maintenance script | Read/write measurements and cache | None explicit |
| Mapbox | Browser | Map tile rendering | Token-scoped |

---

## Deployment

The app is built with Vite (`npm run build`) and deployed to Cloudflare Pages via Wrangler
(`npm run deploy`, which runs tests, build, and `wrangler pages deploy`). There is no server-side
component — Cloudflare Pages serves the static bundle and all runtime data fetching goes directly
from the browser to Supabase and OSM.

---

## Key source files

| File | Role |
|---|---|
| `src/local-maintenance-entrypoint.ts` | Entry point for the maintenance script |
| `src/utils/computed-node-properties.ts` | Shared cache-read / compute / cache-write logic |
| `src/utils/council-calculations.ts` | Overpass-based council name assignment (maintenance only) |
| `src/api/db.ts` | Supabase queries for measurements and computed_node_properties |
| `src/api/osm.ts` | OSM REST API calls (node position, adjacent ways) |
| `src/api/overpass.ts` | Overpass API queries |
| `src/utils/intersection-computed-properties.ts` | Pure functions to compute averages, names, classifications |
| `src/pages/map-page.tsx` | Main map page; triggers the full load sequence on mount |
| `src/utils/utils.ts` | `getIntersections()` orchestrator; measurement grouping; marker colour logic |
| `db/schema.sql` | Postgres schema for both tables |
| `src/config.ts` | Supabase URL, anon key, Mapbox token |
| `src/types.ts` | All shared TypeScript interfaces |
