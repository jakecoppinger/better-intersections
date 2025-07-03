import { Link } from "react-router-dom";

export const InitialPageText = () => <>
      <p>An expansion of the Better Intersections Cinematic Universe™️</p>

      <p>
        {" "}
        These are a collection of charts picking apart the Better Intersections
        dataset. They provide multiple avenues to find further patterns in
        complex and incomplete data, but also as a tool for communicating and
        demonstrating improvement over time (or perhaps lack thereof).
      </p>

      <p>
        I've intentionally added charts to demonstrate the limitations of the
        current accuracy and coverage of the dataset. Please note that the data
        is crowdsourced by a relatively small number of volunteers - for which I
        am incredibly grateful to those who have contributed! - and as such
        should not be used as a primary source of truth for any decision making
        (yet) - but a useful tool for further investigation nonetheless!
      </p>

      <p>
        All code used to generate these charts is{" "}
        <Link
          to="https://github.com/jakecoppinger/better-intersections/blob/main/src/pages/analysis.tsx"
          target="_blank"
          rel="noopener noreferrer"
        >
          open source on Github
        </Link>
        . Contributions are very welcome! Please raise an issue if you find any
        bugs, or feel free to contact me via email (
        <Link to={"mailto:jake@jakecoppinger.com"}>jake@jakecoppinger.com</Link>
        ) or <Link to={"https://mastodon.social/@jakecoppinger"}>Mastodon</Link>
        .
      </p>
      <p>
        Please note: this is a living document and is still in a draft stage - I
        wrote it in 2 days.
      </p>

      <h4>Data sources, implementation and caching concerns</h4>
      <p>
        All geographic data is from OpenStreetMap. All measurement data is from
        Better Intersections. Charts are generated using{" "}
        <Link
          to="https://observablehq.com/plot/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Observable Plot
        </Link>
        .
      </p>

      <p>
        Generating these charts requires a large number of queries to Overpass
        Turbo to fetch OpenStreetMap data (eg. fetching all traffic lights for
        every council in Sydney). To mitigate load on these community-run
        servers, all requests are made and cached to the Better Intersections
        database at compile time.
      </p>
      <p>
        Any intersections added since the last build will trigger client-side
        requests to the OSM API, with the exception of categorising
        intersections by council. This means any measurements since the latest
        build within Sydney will not appear in charts that filter results by
        Sydney specifically.
      </p>

      <h2>Notes on best practice</h2>
      <p>
        More comprehensive details are at{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          to="https://jakecoppinger.com/2023/07/shining-a-light-on-the-traffic-signals-of-sydney/"
        >
          Shining a Light on the Traffic Signals of Sydney (July 2023)
        </Link>
        .
      </p>
      <p>
        The excellent City of Sydney{" "}
        <Link to="https://www.cityofsydney.nsw.gov.au/strategies-action-plans/city-walking-strategy-action-plan-continuing-vision">
          "A City for Walking: Strategy and Action Plan - Continuing the Vision"
        </Link>{" "}
        draft states action 4 (pg. 36) is:
      </p>
      <p>
        <blockquote>
          We will work with Transport for NSW to ensure that signal phasing
          prioritises people walking. The City will advocate for:{" "}
          <ul>
            <li>Automated pedestrian phases </li>
            <li>
              A maximum wait time at intersections of 45 seconds for people
              walking with a target of 30 seconds
            </li>
          </ul>
        </blockquote>
      </p>
      <p>
        I've added lines that display these best practice benchmarks where the
        maximum wait time is displayed (calculated here as the sum of the
        flashing red and solid red durations for the same traffic light sample).
      </p>
</>;