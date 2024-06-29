import { IntersectionStats, Way } from "../types";
import {
  filterOnlyCycleways,
  filterOutNonRoadWays,
  filterOutWaysWithoutName,
} from "./utils";

// TODO: This can do with much improvement, not easy though
export function humanNameForIntersection({
  intersection,
  ways,
  latitude,
  longitude
}: {
  intersection: IntersectionStats;
  ways: Way[];
  latitude: number;
  longitude: number;
}): string | null {
  console.log(JSON.stringify(intersection));
  console.log(JSON.stringify(ways));

  const mainWay = getMainWayForIntersection(ways);

  return mainWay ? `${mainWay.tags.name} at ${latitude},${longitude}` : null;
}

export function calculateAverageIntersectionTotalRedDuration(
  intersection: IntersectionStats
): number {
  const totalCycleTime = intersection.reports.reduce(
    (acc, report) => acc + report.cycleLength,
    0
  );
  return totalCycleTime / intersection.reports.length;
}

/**
 * Calculate the average of the maximum wait time for an intersection.
 * Max wait is calculated as the sum of red and flashing red light durations.
 */
export function calculateAverageIntersectionMaxWait(
  intersection: IntersectionStats
): number {
  return (
    intersection.reports.reduce(
      (acc, report) => acc + report.redDuration + report.flashingDuration,
      0
    ) / intersection.reports.length
  );
}

/**
 * Calculate the average cycle time of all reports for an intersection.
 * @param intersection
 */
export function calculateIntersectionAverageCycleTime(
  intersection: IntersectionStats
): number {
  return (
    intersection.reports.reduce((acc, report) => acc + report.cycleLength, 0) /
    intersection.reports.length
  );
}

/**
 * Takes in unfiltered list of ways and returns the most relevent named main road for the intersection
 * If there is a non-footway, non-cycleway road with a name, it is returned.
 * Otherwise, if there is an adjacent cycleway with a name it is returned
 * Otherwise, if there is an adjacent footway with a name it is returned
 * Otherwise returns null.
 */
export function getMainWayForIntersection(ways: Way[]): Way | null {
  const waysWithNames = filterOutWaysWithoutName(ways);
  const cycleways = filterOnlyCycleways(waysWithNames);
  const nonRoadWays = filterOutNonRoadWays(waysWithNames);

  if (nonRoadWays.length > 0) {
    return nonRoadWays[0];
  }

  if (cycleways.length > 0) {
    return cycleways[0];
  }
  if (waysWithNames.length > 0) {
    return waysWithNames[0];
  }
  return null;
}
