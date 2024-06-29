import { useState, useEffect } from "react";
import { fetchOsmWaysForNode } from "../api/osm";
import {
  IntersectionStats,
  IntersectionStatsWithComputed,
  Way,
} from "../types";
import { HeaderAndFooter } from "../components/HeaderAndFooter";
import { getIntersections, getMainWayForIntersection } from "../utils/utils";
import { Link } from "react-router-dom";
// @ts-ignore
import { HashLink } from "react-router-hash-link";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "../components/Observable/PlotFigure";
import { computedNodeProperties } from "../utils/computed-node-properties";

const IntersectionTableRow = ({
  intersection,
}: {
  intersection: IntersectionStats & { averageTotalRedDuration: number };
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
      <td>{intersection.averageTotalRedDuration} sec.</td>
      <td>{intersection.reports.length} </td>
    </tr>
  );
};
const IntersectionTable = ({
  intersections,
}: {
  intersections:
    | (IntersectionStats & { averageTotalRedDuration: number })[]
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


export default function Analysis() {
  const [intersections, setIntersections] = useState<
    IntersectionStatsWithComputed[] | undefined
  >(undefined);

  useEffect(() => {
    async function getIntersectionData() {
      const intersections = await getIntersections();
      const intersectionsWithExtraStats = await computedNodeProperties( intersections);
      setIntersections(intersectionsWithExtraStats);
    }
    getIntersectionData();
  }, []);

  const longestIntersectionsFirst = intersections
    ? intersections
        .sort((a, b) => b.averageTotalRedDuration - a.averageTotalRedDuration)
        .slice(0, Math.max(5))
    : undefined;
  const shortestIntersectionsFirst = intersections
    ? intersections
        .sort((a, b) => a.averageTotalRedDuration - b.averageTotalRedDuration)
        .slice(0, Math.max(5))
    : undefined;

  return (
    <HeaderAndFooter>
      <h1>Analysis</h1>

      {/* <pre>
        {JSON.stringify(intersectionsWithExtraStats, null, 2)}
      </pre> */}

      {intersections !== undefined ? (
        <PlotFigure
          options={{
            grid: true,
            inset: 10,
            marks: [
              Plot.frame(),
              Plot.dot(intersections, {
                x: "averageCycleTime",
                y: "numRoadLanes",
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
