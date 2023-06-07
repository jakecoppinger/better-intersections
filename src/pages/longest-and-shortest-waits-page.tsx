import { useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { fetchOsmWaysForNode } from "../api/osm";
import { IntersectionStats, Way } from "../types";
import { getIntersections } from "../api/google-sheets";
import HeaderAndFooter from "../components/HeaderAndFooter";
import {
  averageIntersectionTotalRedDuration,
  filterOutNonRoadWays,
  getMainWayForIntersection,
} from "../utils/utils";
import { Link } from "react-router-dom";

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

  const mainWay: Way | undefined =
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
          <th>Average total red duration</th>
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
    IntersectionStats[] | undefined
  >(undefined);

  useEffect(() => {
    async function getIntersectionData() {
      const intersections = await getIntersections();
      setIntersections(intersections);
    }
    getIntersectionData();
  }, []);

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
      <h1>Longest intersection wait times</h1>
      <IntersectionTable intersections={longestIntersectionsFirst} />
      <IntersectionTable intersections={shortestIntersectionsFirst} />
      <div></div>
    </HeaderAndFooter>
  );
}
