# Better Intersections

A map of pedestrian and bicycle traffic light timings using crowdsourced measurements and OpenStreetMap. Measurments are currently focused on Sydney, Australia, but it will work anywhere in the world.

It is live at https://betterintersections.jakecoppinger.com/

See the blog post at https://jakecoppinger.com/2023/06/mapping-pedestrian-traffic-light-timing-in-sydney-australia/
introducing the project. It's also featured at https://bicyclensw.org.au/pedestrians-are-fed-up-with-begging/

PRs very welcome!

# How do I contribute a measurment of a signal?

See http://betterintersections.jakecoppinger.com/about

# Architecture

Better Intersections is a statically build Typescript app hosted on Cloudflare pages.

Data is stored in a Postgres database in Supabase. Pin locations are looked up using the
OpenStreetMap API.

It has a performance overhead loading the pins for the first time but ensures the data is as fresh
as possible (to encourage community contributions).

# Development

## Setup

- Install Node Version Manager (nvm) (https://github.com/nvm-sh/nvm)
- Use correct node version from `.nvmrc`: `nvm use`
- Install packages: `npm install`

## Setting up database

You'll need to get a supabase project. Follow
https://supabase.com/docs/guides/getting-started/tutorials/with-react

Once you have a project, insert your Supabase URL and Anon Key into the `config.ts` file.

More DB notes: https://supabase.com/blog/postgresql-views

## Dev server

`npm run start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

## Tests

See Jest docs for args for watching files etc.

`npm run test`

## Caching data

A number of requests are made to the OSM API to display pins correctly, but in addition to perform
data analysis.

The frontend first checks if any data about an OSM node is cached on the backend. If so this is used.

If an OSM node can't be found in the cache these requests will be send from the frontend. This
occurs in the case where new measurements of a new intersection have been added since the last cache
update.

To support [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security)
updating the cache requires locally running a maintenance script. See `package.json` for details.

## Production build

`yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

## Deploying to Cloudflare Pages using Wrangler

Note: You'll need to set up your own Cloudflare pages site if you'd like to do this.

Docs: https://developers.cloudflare.com/pages/get-started/direct-upload/

- First login to wrangler: `npx wrangler login`
- Choose project and deploy (running tests and build beforehand): `npm run deploy`

# Authors

Started by Jake Coppinger. Hosting (Cloudflare Pages, Supabase) and domain under his name.

See contributors on Github: https://github.com/jakecoppinger/better-intersections/graphs/contributors

# License

GNU AGPLv3. See LICENSE.
