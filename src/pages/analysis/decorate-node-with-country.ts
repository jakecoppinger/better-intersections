import { IntersectionStatsWithComputed } from "../../types";

const supportedCountryRelations = [
  80500, // "Australia",
  2978650, // "Norway",
  50046, // "Denmark",
  52822, // "Sweeden",
  2202162, // "France",
  1311341, // "Spain",
  2323309, // "Netherlands",
];

const supportedCountryNames = [
  "Australia",
  "Norway",
  "Denmark",
  "Sweeden",
  "France",
];


function relationToCountry(relationId: number): string | undefined {
  if (supportedCountryRelations.includes(relationId)) {
    return supportedCountryNames[supportedCountryRelations.indexOf(relationId)];
  }
  return undefined;
}

export type IntersectionWithCountry = IntersectionStatsWithComputed & {
  country: string | undefined;
};


// export async function decorateNodeWithCountry(
//   intersections: IntersectionStatsWithComputed[]
// ): Promise<IntersectionWithCountry[]> {


// }
