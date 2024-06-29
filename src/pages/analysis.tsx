import { useState, useEffect } from "react";
import { fetchOsmWaysForNode } from "../api/osm";
import {
  IntersectionStats,
  IntersectionStatsWithComputed,
  Way,
} from "../types";
import { HeaderAndFooter } from "../components/HeaderAndFooter";
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
      <td>{intersection.averageFlashingAndSolidRedDuration} sec. (max wait)</td>
      <td>{intersection.reports.length} </td>
    </tr>
  );
};
const IntersectionTable = ({
  intersections,
}: {
  intersections:
    | IntersectionStatsWithComputed[]
    | undefined;
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
        {intersections !== undefined ? (
          intersections.map((i) => (
            <IntersectionTableRow key={i.osmId} intersection={i} />
          ))
        ) : (
          <tr>
            <td>Loading...</td>
          </tr>
        )}
      </tbody>
    </table>
  );
};

const universalPlotChannels ={
  "OSM Node ID": {
    value: (d: IntersectionStatsWithComputed) => d.osmId.toString(),
  },
  "Name": {
    value: (d: IntersectionStatsWithComputed) => d.humanName,
  }
}

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

  const longestIntersectionsFirst = intersections
    ? intersections
        .sort((a, b) => b.averageFlashingAndSolidRedDuration - a.averageFlashingAndSolidRedDuration)
        .slice(0, Math.max(5))
    : undefined;
  const shortestIntersectionsFirst = intersections
    ? intersections
        .sort((a, b) => a.averageFlashingAndSolidRedDuration - b.averageFlashingAndSolidRedDuration)
        .slice(0, Math.max(5))
    : undefined;

  return (
    <HeaderAndFooter>
      <h1>Analysis</h1>

      <h2>Average cycle time vs num road lanes, coloured by council</h2>
      {intersections !== undefined ? (
        <PlotFigure
          options={{
            grid: true,
            inset: 10,
            color: { legend: true },
            marks: [
              Plot.frame(),
              Plot.dot(intersections, {
                x: "averageCycleTime",
                y: "numRoadLanes",
                tip: true,
                fill: "councilName",
                channels:universalPlotChannels,
              }),
            ],
          }}
        />
      ) : null}

      <h1>Measurement accuracy</h1>
      <h2>Average cycle time vs cycle time max delta </h2>
      <h3>Only includes intersections with more than one measurement</h3>
      {intersections !== undefined ? (
        <PlotFigure
          options={{
            grid: true,
            inset: 10,
            marks: [
              Plot.frame(),
              Plot.dot(intersections.filter(intersection => intersection.reports.length>1), {
                x: "averageCycleTime",
                y: "cycleTimeMaxDifference",
                tip: true,
                channels: universalPlotChannels,
              }),
            ],
          }}
        />
      ) : null}

      <h2>Cycle time max delta between measurements / average</h2>
      <h3>Only includes intersections with more than one measurement</h3>
      <p>This chart shows that while there are a number of </p>
      {intersections !== undefined ? (
        <PlotFigure
          options={{
            y: {percent: true},
            grid: true,
            inset: 10,
            marks: [
              Plot.frame(),
              Plot.dot(intersections
                .filter(intersection => intersection.reports.length>1)
                .map(i => ({
                  ...i, 
                  maxErrorRatio: i.cycleTimeMaxDifference / i.averageCycleTime}))
              , {
                x: "averageCycleTime",
                y: "maxErrorRatio",
                tip: true,
                channels: universalPlotChannels,
              }),
            ],
          }}
        />
      ) : null}

      <h1>Average cycle time vs road max speed</h1>
      {intersections !== undefined ? (
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
      ) : null}
      <h1>NSW State Roads</h1>
      <h2>Road speed limit vs average cycle time - coloured by state roads</h2>
      <p>Only includes crossings detected within a Sydney Council</p>
      {intersections !== undefined ? (
        <PlotFigure
          options={{
            grid: true,
            inset: 10,
            color: { legend: true },
            marks: [
              Plot.frame(),
              Plot.dot(intersections
                .filter(i => i.councilName)
                .map(i => ({...i,
                  isNSWStateRoadString: i.isNSWStateRoad ? "NSW State Road" : "Unknown"
                }))
                , {
                x: "averageCycleTime",
                y: "roadMaxSpeed",
                tip: true,
                fill: "isNSWStateRoadString",
                channels: universalPlotChannels,
              }),
            ],
          }}
        />
      ) : null}

      <h2>Average green duration vs average cycle time - colour state roads</h2>
      {intersections !== undefined ? (
        <PlotFigure
          options={{
            grid: true,
            inset: 10,
            color: { legend: true },
            marks: [
              Plot.frame(),
              Plot.dot(intersections
                .filter(i => i.councilName)
                .map(i => ({...i,
                  isNSWStateRoadString: i.isNSWStateRoad ? "NSW State Road" : "Unknown"
                })), {
                x: "averageCycleTime",
                y: "averageGreenDuration",
                tip: true,
                fill: "isNSWStateRoadString",
                channels: universalPlotChannels,
              }),
            ],
          }}
        />
      ) : null}


      <h1>Average green duration vs average cycle time - coloured by council name</h1>
      {intersections !== undefined ? (
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
      ) : null}


      <h2>Histogram of all measurements by cycle time</h2>
      <p>
        Cycle time of a crossing is average of all measurements at that crossing
      </p>
      {intersections !== undefined ? (
        <PlotFigure
          options={{
            y: { grid: true },
            marks: [
              Plot.rectY(
                intersections,
                Plot.binX(
                  { y: "count" },
                  {
                    interval: 5,
                    x: "averageCycleTime",
                  }
                )
              ),
              Plot.ruleY([0]),
            ],
          }}
        />
      ) : null}

      <h3>as above, cumulative distribution</h3>
      {intersections !== undefined ? (
        <PlotFigure
          options={{
            y: { grid: true },
            marks: [
              Plot.rectY(
                intersections,
                Plot.binX(
                  { y: "count" },
                  { x: "averageCycleTime", cumulative: true, interval: 5 }
                )
              ),
              Plot.ruleY([0]),
            ],
          }}
        />
      ) : null}

      <IntersectionTable intersections={longestIntersectionsFirst} />
      <IntersectionTable intersections={shortestIntersectionsFirst} />
      <p>
        Know of any intersections that should be on this list? See the{" "}
        <HashLink to={`/about#contributing`}>
          instructions for contributing!
        </HashLink>
      </p>
      {intersections ? (
        <p>
          These examples pulled from {intersections.length} intersections which
          have a measurement - definitely not every intersection in Sydney.
        </p>
      ) : null}
    </HeaderAndFooter>
  );
}
