Better Intersections
====================

A map of pedestrian and bicycle traffic light timings using crowdsourced measurements and OpenStreetMap. Measurments are currently focused on Sydney, Australia, but it will work anywhere in the world. 

It is live at https://betterintersections.jakecoppinger.com/

See the blog post at https://jakecoppinger.com/2023/06/mapping-pedestrian-traffic-light-timing-in-sydney-australia/
introducing the project. It's also featured at https://bicyclensw.org.au/pedestrians-are-fed-up-with-begging/

PRs very welcome!

# How do I contribute a measurment of a signal?

See http://betterintersections.jakecoppinger.com/about

# Architecture
It's currently a statically build Typescript app hosted on Cloudflare pages for simplicity. It has
a performance overhead loading the pins for the first time but ensures the data is as fresh
as possible (to encourage community contributions).

# Development
## Setup
- Install Node Version Manager (nvm) (https://github.com/nvm-sh/nvm)
- Use correct node version from `.nvmrc`: `nvm use`
- Install packages: `npm install`

## Dev server

`npm run start`

Runs the app in the development mode.<br />
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.<br />
You will also see any lint errors in the console.

## Production build
`yarn build`

Builds the app for production to the `build` folder.<br />
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.<br />

## Tests

`yarn test`

Launches the test runner in the interactive watch mode.<br />
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.


# Authors

Started by Jake Coppinger. Google Form, Spreadsheet (public), hosting (Cloudflare Pages) and domain under his name.

See contributions on Github: https://github.com/jakecoppinger/better-intersections/graphs/contributors

# License

GNU AGPLv3. See LICENSE.