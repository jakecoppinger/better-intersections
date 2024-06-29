import { IntersectionStats, OSMNode, OSMRelation} from "../types";
import { overpassTurboRequest } from "../api/overpass";

const sydneyOsmRelation = 5750005;
export const generateAllCouncilsQuery = (relationId: number) => `
[out:json][timeout:25];
rel(${relationId});map_to_area->.searchArea;
(
  relation["admin_level"="6"](area.searchArea);
);
out tags;
`;


/**
 * A very rough algorithm for tagging each intersection with the council it's in!
 * 
 * algo:
 * create map (ie. record, lookup table etc) for all traffic signal nodes
 * for each council:
 *   get all traffic lights in council
 *   make map of traffic lights in council to true
 *   for each traffic light:
 *     check if traffic light is in council signal lookup map
 *     if so, set value of og traffic signal map to council name
 */
export async function decorateIntersectionsWithCouncilName(intersections: IntersectionStats[]): Promise<
  (IntersectionStats & { councilName: string | undefined })[]
> {
  const allSydneyCouncilsQuery = generateAllCouncilsQuery(sydneyOsmRelation);
  const councilResults = (await overpassTurboRequest(
    allSydneyCouncilsQuery
  )) as OSMRelation[];
  const councilList = councilResults
    .filter((council) => council.tags.name)
    .map((council) => ({
      relationId: council.id,
      councilName: council.tags.name as string,
    }))
    .filter((council) => 
      council.councilName === 'Council of the City of Sydney'
      || council.councilName === 'Randwick City Council');
  console.log(councilList);

  /** Map of traffic signal node IDs to names of council they are in */
  const trafficSignalToCouncilLookup = new Map<number,string>();

  // Iterate over each council
  for (const council of councilList) {
    console.log(`Fetching signals in council ${council.councilName}...`);
    const trafficLightNodeIdsInCouncil = await fetchTrafficLightsInCouncil(council.relationId);
    console.log(`Searching for our signals in that council's intersections...`);
    const signalsInCouncilLookup = new Map<number, boolean>();
    for(const nodeId of trafficLightNodeIdsInCouncil) {
      signalsInCouncilLookup.set(nodeId, true);
    }

    for(const intersection of intersections) {
      if(signalsInCouncilLookup.has(intersection.osmId)) {
        console.log(`Found intersection ${intersection.osmId} in council ${council.councilName}!`);
        trafficSignalToCouncilLookup.set(intersection.osmId, council.councilName);
      }
    }
  }
  return intersections.map((intersection) => ({
    ...intersection,
    councilName: trafficSignalToCouncilLookup.get(intersection.osmId),
  }));
}


async function fetchTrafficLightsInCouncil(relationId: number) {
  const trafficLightQuery = 
    `
    [out:json][timeout:25];
    rel(${relationId});map_to_area->.searchArea;
    (
      node["crossing"="traffic_signals"](area.searchArea);
    );
    out tags;
    `;

  const trafficLightResults = (await overpassTurboRequest(
    trafficLightQuery
  )) as OSMNode[];
  const trafficLightNodeIds = trafficLightResults.map((node) => node.id);
  return trafficLightNodeIds;
}
