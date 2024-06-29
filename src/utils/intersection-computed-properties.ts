import { IntersectionStats } from "../types";


export function calculateAverageIntersectionTotalRedDuration(intersection: IntersectionStats): number {
  const totalCycleTime = intersection.reports.reduce((acc, report) => acc + report.cycleLength, 0);
  return totalCycleTime / intersection.reports.length;
}

/**
 * Calculate the average of the maximum wait time for an intersection.
 * Max wait is calculated as the sum of red and flashing red light durations.
 */
export function calculateAverageIntersectionMaxWait(intersection: IntersectionStats): number {
  return intersection
    .reports
    .reduce((acc, report) => acc + report.redDuration + report.flashingDuration, 0)
    / intersection.reports.length;
}

/**
 * Calculate the average cycle time of all reports for an intersection.
 * @param intersection 
 */
export function calculateIntersectionAverageCycleTime(intersection: IntersectionStats): number {
  return intersection.reports.reduce((acc, report) => acc + report.cycleLength, 0) / intersection.reports.length;
}