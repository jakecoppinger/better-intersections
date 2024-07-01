import { useState, useEffect } from "react";
import { fetchOsmWaysForNode } from "../api/osm";
import { IntersectionStatsWithComputed, Way } from "../types";
import {
  HeaderAndFooter,
  HeaderAndFooterWide,
} from "../components/HeaderAndFooter";
import { getIntersections } from "../utils/utils";
import { Link } from "react-router-dom";
// @ts-ignore
import { HashLink } from "react-router-hash-link";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "../components/Observable/PlotFigure";
import { computedNodeProperties } from "../utils/computed-node-properties";
import { getMainWayForIntersection } from "../utils/intersection-computed-properties";

const IntersectionTableRow = ({
  intersection,
}: {
  intersection: IntersectionStatsWithComputed;
}) => {
  const [adjacentWays, setAdjacentWays] = useState<Way[] | undefined>(
    undefined
  );

  useEffect(() => {
    async function getAdjacentRoadWays() {
      const ways = await fetchOsmWaysForNode(intersection.osmId);
      setAdjacentWays(ways);
    }
    getAdjacentRoadWays();
  }, [intersection.osmId]);

  /** mainWay is undefined when loading, null when no adjacent road exists */
  const mainWay: Way | undefined | null =
    adjacentWays !== undefined
      ? getMainWayForIntersection(adjacentWays)
      : undefined;

  return (
    <tr>
      <td>
        <Link to={`/intersection/node/${intersection.osmId}`}>
          {mainWay ? mainWay.tags.name : "Loading..."}
        </Link>
      </td>
      <td>
        <Link to={`/intersection/node/${intersection.osmId}`}>
          {intersection.osmId}
        </Link>
      </td>
      <td>{intersection.averageFlashingAndSolidRedDuration} sec.</td>
      <td>{intersection.reports.length} </td>
    </tr>
  );
};
const IntersectionTable = ({
  intersections,
}: {
  intersections: IntersectionStatsWithComputed[];
}) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Adjacent road name</th>
          <th>Intersection OSM id</th>
          <th>Average max wait</th>
          <th># of samples</th>
        </tr>
      </thead>
      <tbody>
        {intersections.map((i) => (
          <IntersectionTableRow key={i.osmId} intersection={i} />
        ))}
      </tbody>
    </table>
  );
};

const universalPlotChannels = {
  "OSM Node ID": {
    value: (d: IntersectionStatsWithComputed) => d.osmId.toString(),
  },
  Name: {
    value: (d: IntersectionStatsWithComputed) => d.humanName,
  },
};

export default function Analysis() {
  const [intersections, setIntersections] = useState<
    IntersectionStatsWithComputed[] | undefined
  >(undefined);

  useEffect(() => {
    async function getIntersectionData() {
      const intersections = await getIntersections();
      const intersectionsWithExtraStats = await computedNodeProperties(
        intersections
      );
      setIntersections(intersectionsWithExtraStats);
    }
    getIntersectionData();
  }, []);

  if (intersections === undefined) {
    return (
      <HeaderAndFooter>
        <h1>Loading...</h1>
      </HeaderAndFooter>
    );
  }
  /**
   *  "explode" all measurement reports in each intersection into their own object.
   */
  const explodedIntersections = intersections
    // // If we only have one report, duplicate it so we can still plot it and not receive an error
    // .map((intersection) => ({
    //   ...intersection,
    //   reports:
    //     intersection.reports.length === 1
    //       ? [intersection.reports[0], intersection.reports[0]]
    //       : intersection.reports,
    // }))

    .filter((i) => i.reports.length > 1)
    .flatMap((intersection) =>
      intersection.reports.map((report) => ({
        ...report,
        ...intersection,
      }))
    );

  const longestIntersectionsFirst = intersections
    .sort(
      (a, b) =>
        b.averageFlashingAndSolidRedDuration -
        a.averageFlashingAndSolidRedDuration
    )
    .slice(0, Math.max(5));
  const shortestIntersectionsFirst = intersections
    .sort(
      (a, b) =>
        a.averageFlashingAndSolidRedDuration -
        b.averageFlashingAndSolidRedDuration
    )
    .slice(0, Math.max(5));
  const timeXAxisScaleOptions: Plot.ScaleOptions = {
    tickFormat: (d: Date) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, "0");
      return `${year}-${month}`;
      // const day = String(d.getDate()).padStart(2, "0");
      // return `${year}-${month}-${day}`;
    },
    ticks: 7,
    label: "Time",
    type: "time",
  };

  // Hardcoded!! (though nodes with adjacent road with king st in name are also included in the
  // logic where this is used)
  const kingStreetCrossings: number[] = [
    9006017855, // King st offramp
    403820531, // Cycleway light at King & Clarance
    10245932146, // Pedestrian light crossing Clarance at King
    10927817004, // Crossing York St at King
    11256996862, // King st cycleway crossing at Elixabeth st, nortbound
  ];

  function verticalLineAtDate(
    dateStr: string,
    text: string,
    strokeColour: string = "red"
  ) {
    return [
      Plot.ruleX([new Date(dateStr)], { stroke: strokeColour, strokeWidth: 2 }),
      Plot.text([{ x: new Date(dateStr), y: 0, text }], {
        x: "x",
        y: "y",
        text: "text",
        dy: -10, // Adjust vertical position
        dx: 5, // Adjust horizontal position
        textAnchor: "start",
        // anchor: "start",  // Adjust the anchor position
        fill: strokeColour, // Set the color of the text
      }),
    ];
  }

  /**
   * @param axis If x, shows a vertical line for an "x" number.
   * If y, shows a horizontal line for a "y" number
   * @param textAxisOffset
   * @returns
   */
  function cosBestPracticeLines({
    axis,
    textAxisOffset = 0,
    textColour,
  }: {
    axis: "x" | "y";
    textAxisOffset?: number;
    textColour?: string;
  }) {
    const target = 45;
    const stretch = 30;
    const textPlot = (text: string, progress: number) => {
      if (axis === "x") {
        return Plot.text([{ x: progress, y: 0 + textAxisOffset, text }], {
          x: "x",
          y: "y",
          text: "text",
          dy: -10,
          dx: 10,
          frameAnchor: "left",
          fill: textColour || "white",
          rotate: -90,
        });
      }
      return Plot.text(
        [
          {
            y: progress,
            x: 0 + textAxisOffset,
            text,
          },
        ],
        {
          x: "x",
          y: "y",
          text: "text",
          dy: 10,
          dx: 10,
          frameAnchor: "left",
          fill: textColour || "black",
        }
      );
    };

    return [
      textPlot("30s target (CoS)", stretch),
      textPlot("45s max (CoS)", target),
      axis === "x"
        ? Plot.ruleX([stretch], { stroke: "green", strokeWidth: 2 })
        : Plot.ruleY([stretch], { stroke: "green", strokeWidth: 2 }),

      axis === "x"
        ? Plot.ruleX([target], { stroke: "orange", strokeWidth: 2 })
        : Plot.ruleY([target], { stroke: "orange", strokeWidth: 2 }),
    ];
  }

  const histogramPercentageYAxis = (label: string): Plot.ScaleOptions => {
    return {
      tickFormat: (d: number) => {
        return Math.round((d / intersections.length) * 100) + "%";
      },
      ticks: 10,
      label,
      grid: true,
    };
  };

  return (
    <HeaderAndFooterWide pageTitle={"Analysis"}>
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
        The City of Sydney{" "}
        <Link to="https://www.cityofsydney.nsw.gov.au/policy-planning-changes/your-feedback-walking-strategy-action-plan">
          "A City for Walking: Strategy and Action Plan - Continuing the Vision"
        </Link>{" "}
        draft states action 4 (pg 36) is:
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

      <h2>Histogram of average max waits in City of Sydney</h2>
      <p>
        Histogram buckets (columns): 10 second buckets centred on multiples of 5
        that aren't multiples of 10. eg: all measurements between 15 and 25
        seconds are placed in the 20 second bucket (column).
      </p>
      <p>
        Average max wait of a crossing is calculated by summing the flashing red
        and solid red times of each measurement, then averaging across all
        measurements at that crossing.
      </p>
      <PlotFigure
        options={{
          y: histogramPercentageYAxis("Percentage of total intersections"),
          marks: [
            Plot.rectY(
              intersections.filter(
                (i) => i.councilName === "Council of the City of Sydney"
              ),
              Plot.binX(
                { y: "count" },
                {
                  thresholds: (x) => {
                    return [
                      5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135,
                      145, 155, 165, 175, 185, 195, 205,
                    ];
                  },
                  x: "averageFlashingAndSolidRedDuration",
                }
              )
            ),
            Plot.ruleY([0]),
            ...cosBestPracticeLines({ axis: "x" }),
          ],
        }}
      />

      <h2>Average cycle time vs num road lanes, coloured by council</h2>
      <p>
        Strangely there aren't currently many samples outside the City of Sydney
        of very wide roads. The outliers in the top left (lots of lanes,
        relatively low max wait) tend to be light-rail adjacent main roads. One
        example is Pitt St adjacent to Central Station (7 lanes):{" "}
        <Link
          to="https://betterintersections.jakecoppinger.com/intersection/node/3500777435"
          target="_blank"
          rel="noopener noreferrer"
        >
          betterintersections.jakecoppinger.com/intersection/node/3500777435
        </Link>
      </p>

      <PlotFigure
        options={{
          x: { label: "Average max wait (s)" },
          y: { label: "Number of road lanes" },
          grid: true,
          inset: 10,
          color: { legend: true },
          marks: [
            Plot.frame(),
            Plot.dot(intersections, {
              x: "averageFlashingAndSolidRedDuration",
              y: "numRoadLanes",
              tip: true,
              fill: "councilName",
              channels: universalPlotChannels,
            }),
            ...cosBestPracticeLines({ axis: "x", textColour: "black" }),
          ],
        }}
      />

      <h1>Change over time</h1>

      <h2>Change in max wait per intersection over time</h2>
      <p>
        Only includes intersections with more than one measurement, meaning{" "}
        <b>
          if you see a dot which appears to be missing a line, that means the
          measurements taken at the same time were so similar that they overlap.
        </b>
      </p>
      <p>
        Vertical lines show a wide variance in measurements taken at the exact
        same time.
      </p>
      <p>
        If these lines all go down, cycle times across all crossings are
        dropping.
      </p>
      <p>
        The variation of the NorthWest T-Way at Westmead Hospital (node{" "}
        <a
          href="https://www.openstreetmap.org/node/610196239"
          target="_blank"
          rel="noopener noreferrer"
        >
          openstreetmap.org/node/610196239
        </a>
        ) appears to have a huge variance. Perhaps this outlier is a measurement
        error and warrants further investigation. See details of all
        measurements at this intersection at{" "}
        <Link
          to="https://betterintersections.jakecoppinger.com/intersection/node/610196239"
          target="_blank"
          rel="noopener noreferrer"
        >
          betterintersections.jakecoppinger.com/intersection/node/610196239
        </Link>
        .
      </p>
      <PlotFigure
        options={{
          x: {
            label: "Measurement time",
            ...timeXAxisScaleOptions,
          },
          y: { label: "Max wait time (seconds)" },
          marks: [
            Plot.ruleY([0]),
            Plot.lineY(
              explodedIntersections.map((i) => ({
                ...i,
                flashingRedAndSolidRedLength:
                  i.flashingDuration + i.redDuration,
              })),
              {
                x: "timestamp",
                y: "flashingRedAndSolidRedLength",
                stroke: "osmId",
                tip: "x",
                channels: universalPlotChannels,
              }
            ),
            Plot.dot(
              explodedIntersections.map((i) => ({
                ...i,
                flashingRedAndSolidRedLength:
                  i.flashingDuration + i.redDuration,
              })),
              {
                x: "timestamp",
                y: "flashingRedAndSolidRedLength",
                stroke: "osmId",
                fill: "osmId",
                tip: "x",
                channels: universalPlotChannels,
              }
            ),
            ...cosBestPracticeLines({
              axis: "y",
              // The text is actually placed on the graph, so need to add an offset so
              // the scale doesn't go to almost 0
              textAxisOffset: new Date("2023-03-15").getTime(),
            }),
          ],
        }}
      />
      <h2>Change in cycle time per intersection over time</h2>
      <PlotFigure
        options={{
          marks: [
            Plot.ruleY([0]),
            Plot.lineY(explodedIntersections, {
              x: "timestamp",
              y: "cycleLength",
              stroke: "osmId",
              tip: "x",
              channels: universalPlotChannels,
            }),
            Plot.dot(explodedIntersections, {
              x: "timestamp",
              y: "cycleLength",
              stroke: "osmId",
              fill: "osmId",
              tip: "x",
              channels: universalPlotChannels,
            }),
          ],
          x: timeXAxisScaleOptions,
        }}
      />

      <h2>
        Change in max wait time per intersection over time, City of Sydney only
      </h2>
      <p>
        As above, however only includes crossings within the City of Sydney
        council.
      </p>

      <PlotFigure
        options={{
          x: {
            label: "Time",
            ...timeXAxisScaleOptions,
          },
          y: {label: "Max wait time (s)"},
          marks: [
            Plot.ruleY([0]),
            Plot.lineY(
              explodedIntersections.filter(
                (i) => i.councilName === "Council of the City of Sydney"
              ),
              {
                x: "timestamp",
                y: "cycleLength",
                stroke: "osmId",
                tip: "x",
                channels: universalPlotChannels,
              }
            ),
            Plot.dot(
              explodedIntersections.filter(
                (i) => i.councilName === "Council of the City of Sydney"
              ),
              {
                x: "timestamp",
                y: "cycleLength",
                stroke: "osmId",
                fill: "osmId",
                tip: "x",
                channels: universalPlotChannels,
              }
            ),
            ...cosBestPracticeLines({
              axis: "y",
              // The text is actually placed on the graph, so need to add an offset so
              // the scale doesn't go to almost 0
              textAxisOffset: new Date("2023-03-15").getTime(),
            }),
          ],
        }}
      />

      <h2>
        Change in cycle time per intersection over time, City of Sydney King
        Street adjacent signals only
      </h2>
      <p>
        As above, however only includes crossings along or adjacent to King
        Street City of Sydney council.
      </p>

      <p>
        The{" "}
        <Link to="https://www.transport.nsw.gov.au/system/files/media/documents/2024/King-Street-cycleway_consultation-report_February-2024.pdf">
          King Street Cycleway Community consultation report (February 2024)
        </Link>{" "}
        includes in the feedback a question: "Currently there are substantial
        wait times for people riding bikes at traffic lights, which encourages
        non-compliance for cyclists. How will you fix this?"
      </p>
      <p>
        The answer stated is "Traffic lights in Sydney are managed and monitored
        by Sydney Coordinated Adaptive Traffic System (SCATS).{" "}
        <b>
          We will monitor the wait times along King Street after construction is
          complete.
        </b>
        " (emphasis mine)
      </p>

      <p>
        This chart will demonstrate publicly if any improvements are made after
        construction completes, hopefully next year!
      </p>

      <PlotFigure
        options={{
          marks: [
            Plot.ruleY([0]),
            Plot.lineY(
              explodedIntersections.filter(
                (i) =>
                  (i.humanName && i.humanName.includes("King Street")) ||
                  kingStreetCrossings.includes(i.osmId)
              ),
              {
                x: "timestamp",
                y: "cycleLength",
                stroke: "osmId",
                tip: "x",
                channels: universalPlotChannels,
              }
            ),
            Plot.dot(
              explodedIntersections.filter(
                (i) =>
                  (i.humanName && i.humanName.includes("King Street")) ||
                  kingStreetCrossings.includes(i.osmId)
              ),
              {
                x: "timestamp",
                y: "cycleLength",
                stroke: "osmId",
                fill: "osmId",
                tip: "x",
                channels: universalPlotChannels,
              }
            ),
            ...cosBestPracticeLines({
              axis: "y",
              textAxisOffset: new Date("2023-03-25").getTime(),
            }),
          ],
          x: timeXAxisScaleOptions,
        }}
      />

      <h1>Dataset and measurement distribution</h1>

      <h2>
        Histogram of average cycle time of all crossings, 1 second buckets
      </h2>
      <p>
        Cycle time of a crossing is average of all measurements at that crossing
      </p>
      <PlotFigure
        options={{
          y: histogramPercentageYAxis("Percentage of total intersections"),
          marks: [
            Plot.rectY(
              intersections,
              Plot.binX(
                { y: "count" },
                {
                  interval: 1,
                  x: "averageCycleTime",
                }
              )
            ),
            Plot.ruleY([0]),
          ],
        }}
      />
      <h2>
        Histogram of all crossings average cycle times, 10 second buckets
        centred on multiples of 5
      </h2>
      <p>
        Eg, all measurements between 10 and 20 seconds are placed in the 15
        second bucket (column).
      </p>
      <p>
        Cycle time of a crossing is average of all measurements at that crossing
      </p>
      <PlotFigure
        options={{
          y: histogramPercentageYAxis("Percentage of total intersections"),
          marks: [
            Plot.rectY(
              intersections,
              Plot.binX(
                { y: "count" },
                {
                  thresholds: (x) => {
                    return [
                      0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130,
                      140, 150, 160, 170, 180, 190, 200,
                    ];
                  },
                  x: "averageCycleTime",
                }
              )
            ),
            Plot.ruleY([0]),
          ],
        }}
      />

      <h2>
        Histogram of all crossings average cycle times, 10 second buckets
        centred on decades
      </h2>
      <p>
        Eg, all mesurements between 15 and 25 seconds are placed in the 20
        second bucket (column).
      </p>
      <p>
        <b>Notice how different this is to the above!</b> This suggests SCATS
        programming tends towards cycle times set at durations a multiple of 10.
      </p>
      <p>
        Cycle time of a crossing is average of all measurements at that crossing
      </p>
      <PlotFigure
        options={{
          y: histogramPercentageYAxis("Percentage of total intersections"),
          marks: [
            Plot.rectY(
              intersections,
              Plot.binX(
                { y: "count" },
                {
                  thresholds: (x) => {
                    return [
                      5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135,
                      145, 155, 165, 175, 185, 195, 205,
                    ];
                  },
                  x: "averageCycleTime",
                }
              )
            ),
            Plot.ruleY([0]),
          ],
        }}
      />

      <h2>
        Histogram of City of Sydney crossing average cycle times, 10 second
        buckets centred on decades
      </h2>
      <p>
        There are a lot more 90 second cycle times than the wider dataset. This
        suggests there are a large number of crossings in the City of Sydney
        with nominal cycle times of 90 seconds. This matches with my
        investigation on{" "}
        <Link
          target="_blank"
          rel="noopener noreferrer"
          to="https://jakecoppinger.com/2023/07/shining-a-light-on-the-traffic-signals-of-sydney/"
        >
          Shining a Light on the Traffic Signals of Sydney (July 2023)
        </Link>{" "}
        that the CBD grid is on a 90 second cycle time during peak hours.
      </p>
      <PlotFigure
        options={{
          marks: [
            Plot.rectY(
              intersections.filter(
                (i) => i.councilName === "Council of the City of Sydney"
              ),
              Plot.binX(
                { y: "count" },
                {
                  thresholds: (x) => {
                    return [
                      5, 15, 25, 35, 45, 55, 65, 75, 85, 95, 105, 115, 125, 135,
                      145, 155, 165, 175, 185, 195, 205,
                    ];
                  },
                  x: "averageCycleTime",
                  // cumulative: true
                }
              )
            ),
            Plot.ruleY([0]),
          ],
        }}
      />

      <h2>How many measurements are there of each crossing in the dataset?</h2>
      <p>The vast majority of crossings only have one measurement</p>

      <PlotFigure
        options={{
          y: { grid: true },
          marks: [
            Plot.rectY(
              intersections.map((i) => ({
                ...i,
                numReports: i.reports.length,
              })),
              Plot.binX(
                { y: "count" },
                {
                  interval: 1,
                  x: "numReports",
                }
              )
            ),
            Plot.ruleY([0]),
          ],
        }}
      />

      <h2>
        How many measurements are there of each crossing in the dataset in the
        City of Sydney?
      </h2>
      <p>
        This indicates the number of measurements per crossing in CoS is
        currently comparable to the wider dataset.
      </p>
      <PlotFigure
        options={{
          y: { grid: true },
          marks: [
            Plot.rectY(
              intersections
                .filter(
                  (i) => i.councilName === "Council of the City of Sydney"
                )
                .map((i) => ({ ...i, numReports: i.reports.length })),
              Plot.binX(
                { y: "count" },
                {
                  interval: 1,
                  x: "numReports",
                }
              )
            ),
            Plot.ruleY([0]),
          ],
        }}
      />

      <h2>Cycle time by first measurement time</h2>
      <p>
        This indicates there are cycles of volunteer contribution to Better
        Intersections data.
      </p>
      <PlotFigure
        options={{
          grid: true,
          inset: 10,
          marks: [
            Plot.frame(),
            Plot.dot(
              intersections.map((i) => ({
                ...i,
                firstMeasurementTime: new Date(i.reports[0].timestamp),
              })),
              {
                x: "firstMeasurementTime",
                y: "averageCycleTime",
                tip: true,
                channels: universalPlotChannels,
              }
            ),

            Plot.ruleX([new Date("2023-09-25")], { stroke: "red" }),
            ...verticalLineAtDate("2023-09-25", "ABC interview", "green"),
          ],
          x: timeXAxisScaleOptions,
          y: { label: "Average cycle time (seconds)" },
        }}
      />

      <h1>Average cycle time vs road max speed</h1>

      <PlotFigure
        options={{
          grid: true,
          inset: 10,
          marks: [
            Plot.frame(),
            Plot.dot(intersections, {
              x: "averageCycleTime",
              y: "roadMaxSpeed",
              tip: true,
              channels: universalPlotChannels,
            }),
          ],
        }}
      />

      <h1>NSW State Roads</h1>
      <p>
        I'm not aware of a comprehensive, machine readable dataset of state
        roads in NSW (let alone a OpenStreetMap compatible dataset). In the
        meantime I've started a manually updated list of road names that are
        state roads. This is not comprehensive and may be incorrect, however due
        to its limited nature false negatives (ie. roads incorrectly classified{" "}
        <i>not</i> as a state road) are far more likely than false positives
        (ie. roads incorrectly classified as a state road).
      </p>
      <p>
        Note that as state roads are optimised for "movement" rather than
        "place" it is expected they will have higher speed limits and longer
        cycle times than local roads. TfNSW set traffic signal timing no
        matter which agency is the maintainer of the road.
      </p>
      <h2>
        Road speed limit vs average cycle time in City of Sydney- coloured by
        state roads
      </h2>
      <PlotFigure
        options={{
          y: { label: "Road speed limit (km/h)" },
          x: { label: "Average max wait (seconds)" },
          grid: true,
          inset: 10,
          color: { legend: true },
          marks: [
            Plot.frame(),
            Plot.dot(
              intersections
                .filter(
                  (i) => i.councilName === "Council of the City of Sydney"
                )
                .map((i) => ({
                  ...i,
                  isNSWStateRoadString: i.isNSWStateRoad
                    ? "NSW State Road"
                    : "Unknown",
                })),
              {
                x: "averageFlashingAndSolidRedDuration",
                y: "roadMaxSpeed",
                tip: true,
                fill: "isNSWStateRoadString",
                channels: universalPlotChannels,
              }
            ),

            ...cosBestPracticeLines({ axis: "x", textAxisOffset: 40 }),
          ],
        }}
      />

      <h2>Road speed limit vs average max wait - coloured by state roads</h2>
      <p>Only includes crossings detected within a Sydney Council</p>
      <PlotFigure
        options={{
          grid: true,
          inset: 10,
          color: { legend: true },
          marks: [
            Plot.frame(),
            Plot.dot(
              intersections
                .filter((i) => i.councilName)
                .map((i) => ({
                  ...i,
                  isNSWStateRoadString: i.isNSWStateRoad
                    ? "NSW State Road"
                    : "Unknown",
                })),
              {
                x: "averageCycleTime",
                y: "roadMaxSpeed",
                tip: true,
                fill: "isNSWStateRoadString",
                channels: universalPlotChannels,
              }
            ),
          ],
        }}
      />

      <h2>Average green duration vs average cycle time - colour state roads</h2>

      <PlotFigure
        options={{
          grid: true,
          inset: 10,
          color: { legend: true },
          marks: [
            Plot.frame(),
            Plot.dot(
              intersections
                .filter((i) => i.councilName)
                .map((i) => ({
                  ...i,
                  isNSWStateRoadString: i.isNSWStateRoad
                    ? "NSW State Road"
                    : "Unknown",
                })),
              {
                x: "averageCycleTime",
                y: "averageGreenDuration",
                tip: true,
                fill: "isNSWStateRoadString",
                channels: universalPlotChannels,
              }
            ),
          ],
        }}
      />

      <h1>
        Average green duration vs average cycle time - coloured by council name
      </h1>

      <PlotFigure
        options={{
          grid: true,
          inset: 10,
          color: { legend: true },
          marks: [
            Plot.frame(),
            Plot.dot(intersections, {
              x: "averageCycleTime",
              y: "averageGreenDuration",
              tip: true,
              fill: "councilName",
              channels: universalPlotChannels,
            }),
          ],
        }}
      />

      <h1>Longest pedestrian crossing wait times measured</h1>
      <p>
        These examples pulled from {intersections.length} crossings which have a
        measurement - definitely not every intersection in Sydney.
      </p>
      <IntersectionTable intersections={longestIntersectionsFirst} />
      <h1>Shortest pedestrian crossing wait times measured</h1>
      <IntersectionTable intersections={shortestIntersectionsFirst} />
      <p>
        Know of any intersections that should be on this list? See the{" "}
        <HashLink to={`/about#contributing`}>
          instructions for contributing!
        </HashLink>
      </p>
      <p>
        These examples pulled from {intersections.length} intersections which
        have a measurement - definitely not every intersection in Sydney.
      </p>
    </HeaderAndFooterWide>
  );
}
