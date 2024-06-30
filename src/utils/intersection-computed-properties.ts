import { IntersectionStats, Way } from "../types";
import {
  filterOnlyCycleways,
  filterOutNonRoadWays,
  filterOutWaysWithoutName,
} from "./utils";

export { isIntersectionOnNSWStateRoad } from "./IntersectionPropertyCalculations/isNSWStateRoad";

export function findRoadMaxSpeed(mainWay: Way | null): number | null {
  if (!mainWay) {
    return null;
  }
  return mainWay.tags.maxspeed ? parseInt(mainWay.tags.maxspeed) : null;
}

export function roadClassificationForIntersection(
  mainWay: Way | null
): string | null {
  if (!mainWay) {
    return null;
  }

  return mainWay.tags.highway;
}

// TODO: This can do with much improvement, not easy though
export function humanNameForIntersection({
  intersection,
  ways,
  latitude,
  longitude,
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

export const calculateAverageFlashingAndSolidRedDuration = (
  intersection: IntersectionStats
): number =>
  intersection.reports.reduce(
    (acc, report) => acc + report.flashingDuration + report.redDuration,
    0
  ) / intersection.reports.length;

export const calculateAverageGreenDuration = (
  intersection: IntersectionStats
): number =>
  intersection.reports.reduce((acc, report) => acc + report.greenDuration, 0) /
  intersection.reports.length;

export const calculateAverageFlashingRedDuration = (
  intersection: IntersectionStats
): number =>
  intersection.reports.reduce(
    (acc, report) => acc + report.flashingDuration,
    0
  ) / intersection.reports.length;

export const calculateAverageSolidRedDuration = (
  intersection: IntersectionStats
): number =>
  intersection.reports.reduce((acc, report) => acc + report.redDuration, 0) /
  intersection.reports.length;

export const calculateAverageCycleTime = (
  intersection: IntersectionStats
): number =>
  intersection.reports.reduce((acc, report) => acc + report.cycleLength, 0) /
  intersection.reports.length;

export const calculateCycleTimeMaxDifference = (
  intersection: IntersectionStats
): number =>
  Math.max(...intersection.reports.map((report) => report.cycleLength)) -
  Math.min(...intersection.reports.map((report) => report.cycleLength));

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
  const onlyRoadWays = filterOutNonRoadWays(waysWithNames);

  if (onlyRoadWays.length > 0) {
    // TODO: Pick way with the highest rated road classification if more than one
    
    // if (onlyRoadWays.length > 1) {
    //   console.warn(
    //     `Node ${ways[0].id} has multiple non-road ways ${JSON.stringify(
    //       onlyRoadWays
    //     )}. Picking the first one.`
    //   );
    // }
    return onlyRoadWays[0];
  }

  if (cycleways.length > 0) {
    return cycleways[0];
  }
  if (waysWithNames.length > 0) {
    return waysWithNames[0];
  }
  return null;
}
