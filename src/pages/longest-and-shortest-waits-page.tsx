import { useState, useEffect } from "react";
import { fetchOsmWaysForNode } from "../api/osm";
import {
  IntersectionStats,
  IntersectionStatsWithComputed,
  Way,
} from "../types";
import { HeaderAndFooter } from "../components/HeaderAndFooter";
import { filterOutNonRoadWays, getIntersections } from "../utils/utils";
import { Link } from "react-router-dom";
// @ts-ignore
import { HashLink } from "react-router-hash-link";
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
      <td>{intersection.averageFlashingAndSolidRedDuration} sec. (max wait)</td>
      <td>{intersection.reports.length} </td>
    </tr>
  );
};
const IntersectionTable = ({
  intersections,
}: {
  intersections: IntersectionStatsWithComputed[] | undefined;
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

export default function LongestAndShortestWaits() {
  const [intersections, setIntersections] = useState<
    IntersectionStatsWithComputed[] | undefined
  >(undefined);

  useEffect(() => {
    async function getIntersectionData() {
      const intersections = await getIntersections();
      const richIntersections = await computedNodeProperties(intersections);
      setIntersections(richIntersections);
    }
    getIntersectionData();
  }, []);

  const longestIntersectionsFirst = intersections
    ? intersections
        .sort(
          (a, b) =>
            b.averageFlashingAndSolidRedDuration -
            a.averageFlashingAndSolidRedDuration
        )
        .slice(0, Math.max(5))
    : undefined;
  const shortestIntersectionsFirst = intersections
    ? intersections
        .sort(
          (a, b) =>
            a.averageFlashingAndSolidRedDuration -
            b.averageFlashingAndSolidRedDuration
        )
        .slice(0, Math.max(5))
    : undefined;

  return (
    <HeaderAndFooter>
      <h1>Longest pedestrian intersection wait times measured</h1>
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

      <p>
        See <Link to={"/about"}>about</Link> for data download.
      </p>
    </HeaderAndFooter>
  );
}
