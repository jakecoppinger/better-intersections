import { useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { fetchOsmWaysForNode } from "../api/osm";
import { IntersectionStats, Way } from "../types";
import { getIntersections } from "../api/google-sheets";
import HeaderAndFooter from "../components/HeaderAndFooter";
import { averageIntersectionTotalRedDuration, getMainWayForIntersection } from "../utils/utils";

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
      const ways = (await fetchOsmWaysForNode(intersection.osmId)).filter(
        (way) => way.tags.highway !== "footway"
      );

      setAdjacentWays(ways);
    }
    getAdjacentWays();
  }, [intersection.osmId]);

  const mainWay: Way | undefined = adjacentWays !== undefined
    ? getMainWayForIntersection(adjacentWays)
    : undefined;

  return (
    <tr>
      <td>{mainWay ? mainWay.tags.name: 'Loading...'}</td>
      <td>{intersection.osmId}</td>
      <td>{intersection.averageTotalRedDuration}</td>
    </tr>
  );
};
const IntersectionTable = ({
  intersections,
}: {
  intersections: (IntersectionStats & { averageTotalRedDuration: number })[];
}) => {
  return (
    <table>
      <thead>
        <tr>
          <th>Adjacent road name</th>
          <th>Intersection id</th>
          <th>Total red duration</th>
        </tr>
      </thead>
      <tbody>
        {intersections !== undefined
          ? intersections.map((i) => <IntersectionTableRow intersection={i} />)
          : null}
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
    : [];
  const longestIntersectionsFirst = intersectionsWithAverageTotalRedDuration
    ? intersectionsWithAverageTotalRedDuration
        .sort((a, b) => b.averageTotalRedDuration - a.averageTotalRedDuration)
        .slice(0, Math.max(5))
    : [];
  const shortestIntersectionsFirst = intersectionsWithAverageTotalRedDuration
    ? intersectionsWithAverageTotalRedDuration
        .sort((a, b) => a.averageTotalRedDuration - b.averageTotalRedDuration)
        .slice(0, Math.max(5))
    : [];

  return (
    <HeaderAndFooter>
      <h1>Longest intersection wait times</h1>
      <IntersectionTable intersections={longestIntersectionsFirst} />
      <IntersectionTable intersections={shortestIntersectionsFirst} />
      <div></div>
    </HeaderAndFooter>
  );
}
