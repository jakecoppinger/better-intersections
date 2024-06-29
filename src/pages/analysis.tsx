import { useState, useEffect, useRef } from "react";
import { fetchOsmWaysForNode } from "../api/osm";
import { IntersectionStats, Way } from "../types";
import { HeaderAndFooter } from "../components/HeaderAndFooter";
import {
  averageIntersectionTotalRedDuration,
  filterOutNonRoadWays,
  getIntersections,
  getMainWayForIntersection,
  intersectionAverageCycleTime,
} from "../utils/utils";
import { Link } from "react-router-dom";
// @ts-ignore
import { HashLink } from "react-router-hash-link";
import * as Plot from "@observablehq/plot";
import { PlotFigure } from "../components/Observable/PlotFigure";


const IntersectionTableRow = ({
  intersection,
}: {
  intersection: IntersectionStats & { averageTotalRedDuration: number };
}) => {
  const [adjacentWays, setAdjacentWays] = useState<Way[] | undefined>(
    undefined
  );

  useEffect(() => {
    async function getAdjacentWays() {
      const ways = filterOutNonRoadWays(
        await fetchOsmWaysForNode(intersection.osmId)
      );

      setAdjacentWays(ways);
    }
    getAdjacentWays();
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
    IntersectionStats[] | undefined
  >(undefined);

  useEffect(() => {
    async function getIntersectionData() {
      const intersections = await getIntersections();
      setIntersections(intersections);
    }
    getIntersectionData();
  }, []);

  /**
   * Array of intersections. Cycle time of each intersection is calculated as average of all
   * measurements (reports)
   */
  const intersectionsByAverageCycleTime = intersections
    ? intersections.map((i) => {
      return {
        ...i,
        averageCycleTime: intersectionAverageCycleTime(i),
      };
    })
    : undefined;

  const intersectionsWithAverageTotalRedDuration = intersections
    ? intersections.map((i) => {
      return {
        ...i,
        averageTotalRedDuration: averageIntersectionTotalRedDuration(i),
      };
    })
    : undefined;

  const longestIntersectionsFirst = intersectionsWithAverageTotalRedDuration
    ? intersectionsWithAverageTotalRedDuration
      .sort((a, b) => b.averageTotalRedDuration - a.averageTotalRedDuration)
      .slice(0, Math.max(5))
    : undefined;
  const shortestIntersectionsFirst = intersectionsWithAverageTotalRedDuration
    ? intersectionsWithAverageTotalRedDuration
      .sort((a, b) => a.averageTotalRedDuration - b.averageTotalRedDuration)
      .slice(0, Math.max(5))
    : undefined;

  return (
    <HeaderAndFooter>
      <h1>Analysis</h1>
      {intersectionsByAverageCycleTime !== undefined ?
      <PlotFigure
        options={{
          y: { grid: true },
          marks: [
            Plot.rectY(intersectionsByAverageCycleTime, Plot.binX({ y: "count" }, { x: "averageCycleTime" })),
            Plot.ruleY([0])
          ]
        }}
      />
      : null}

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