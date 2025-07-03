import { IntersectionStatsWithComputed } from "../../types";

export function MaxWaitComponent({ council, threshold,
  intersections
}: {
  council: string, threshold: number,
  intersections: IntersectionStatsWithComputed[]
}) {

  const intersectionsInCouncil = intersections.filter((i) => i.councilName === council);
  const numIntersectionsInCouncil = intersectionsInCouncil.length;

  const numIntersectionsInCouncilUnderMaxWait =
    intersectionsInCouncil
      .filter((i) => i.averageFlashingAndSolidRedDuration <= threshold).length;

  return <>
    <p>In the {council},{" "}
      {((numIntersectionsInCouncilUnderMaxWait / numIntersectionsInCouncil) * 100).toFixed(1)}%{" "}
      intersections have a max pedestrian wait of &lt;= {threshold} seconds{" "}
      ({numIntersectionsInCouncilUnderMaxWait} of {numIntersectionsInCouncil} intersections).
    </p>
  </>


}