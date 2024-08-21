import {
  fetchAllCachedNodeProperties,
  insertComputedNodeProperties,
} from "../api/db";
import { fetchOsmWaysForNode, requestOsmNodePosition } from "../api/osm";
import {
  ComputedNodeProperties,
  IntersectionStats,
  IntersectionStatsWithComputed,
} from "../types";
import { generateSignalNodeIdToCouncilNameMap } from "./council-calculations";
import {
  calculateAverageCycleTime,
  calculateAverageFlashingAndSolidRedDuration,
  calculateAverageFlashingRedDuration,
  calculateAverageGreenDuration,
  calculateAverageSolidRedDuration,
  calculateCycleTimeMaxDifference,
  findRoadMaxSpeed,
  getMainWayForIntersection,
  humanNameForIntersection,
  isIntersectionOnNSWStateRoad,
  roadClassificationForIntersection,
} from "./intersection-computed-properties";
import { SupabaseClient } from "@supabase/supabase-js";

function computeAverages(intersection: IntersectionStats) {
  return {
      averageCycleTime: calculateAverageCycleTime(intersection),
      averageGreenDuration: calculateAverageGreenDuration(intersection),
      averageFlashingRedDuration: calculateAverageFlashingRedDuration(intersection),
      averageFlashingAndSolidRedDuration: calculateAverageFlashingAndSolidRedDuration(intersection),
      averageSolidRedDuration: calculateAverageSolidRedDuration(intersection),
      cycleTimeMaxDifference: calculateCycleTimeMaxDifference(intersection),
  }
}

/**
 * This function is used by both the frontend and maintenance scripts to ensure
 * the logic for generating computed properties on the frontend and backend don't drift.
 *
 * When called from the frontend, any missing properties will be computed on the frontend.
 * When called from the backend, any missing properties will be computed and then inserted into the
 * DB.
 */
export async function computedNodeProperties(
  intersections: IntersectionStats[],
  logProgress?: boolean,
  /**
   * This is only used when running in the backend.
   */
  serviceRoleSupabase?: SupabaseClient
): Promise<IntersectionStatsWithComputed[]> {
  const osmNodeIds = intersections
    .map((intersection) => intersection.osmId)
  
  const newIntersections: IntersectionStatsWithComputed[] = [];

  console.log(`Fetching cached node ids from DB...`);
  const cachedNodeProperties = await fetchAllCachedNodeProperties();
  console.log(`Cache length: ${cachedNodeProperties.length} nodes.`);

  const cachedNodeIdsMap = new Map<number, ComputedNodeProperties>();
  cachedNodeProperties.forEach((value) => {
    cachedNodeIdsMap.set(value.osmId, value);
  });

  const signalNodeIdToCouncilNameMap = 
    // Only generate map if on backend. If on frontend and it's cached
    // we won't need this anyway.
    serviceRoleSupabase ? 
      await generateSignalNodeIdToCouncilNameMap(intersections)
      : new Map<number, string>();

  // We intentionally want to do this in serial to avoid hitting OSM API all at once
  for (let i = 0; i < osmNodeIds.length; i++) {
    const nodeId = osmNodeIds[i];
    if (cachedNodeIdsMap.has(nodeId)) {
      const cachedProperties = cachedNodeIdsMap.get(
        nodeId
      ) as ComputedNodeProperties;
      newIntersections.push({
        ...intersections[i],
        ...cachedProperties,
        // TODO: This is a hack - we shouldn't be storing averages in the DB.
        ...computeAverages(intersections[i]),
      });
      continue;
    }
    console.log(`Cache miss for node ${nodeId}. Fetching from OSM API.`);

    const intersection: IntersectionStats = intersections[i];
    const ways = await fetchOsmWaysForNode(nodeId);

    // Generate computed properties
    const { lat: latitude, lon: longitude } = await requestOsmNodePosition(
      nodeId
    );

    const mainWay = getMainWayForIntersection(ways);

    // TODO: Add error handling if num lanes is not an integer
    const numRoadLanes = mainWay ? parseInt(mainWay.tags.lanes) : null;

    const isRoadOneway = mainWay ? mainWay.tags.oneway === "yes" : false;
    const humanName = humanNameForIntersection({
      intersection,
      ways,
      latitude,
      longitude,
    });


    const allComputedProperties: ComputedNodeProperties = {
      osmId: nodeId,
      latitude,
      longitude,

      // TODO: We shouldn't be storing averages in the DB.
      // They are recalculated from cache above.
      ...computeAverages(intersection),

      numRoadLanes,
      isRoadOneway,
      humanName,
      councilName: signalNodeIdToCouncilNameMap.get(nodeId) || null,
      isNSWStateRoad: isIntersectionOnNSWStateRoad(intersection, mainWay),
      osmHighwayClassification: roadClassificationForIntersection(mainWay),
      roadMaxSpeed: findRoadMaxSpeed(mainWay),
    };
    const intersectionStatsWithComputed: IntersectionStatsWithComputed = {
      ...intersection,
      ...allComputedProperties,
    };

    newIntersections.push(intersectionStatsWithComputed);

    // If we're in the backend maintenance script, insert the computed properties into the DB.
    if (serviceRoleSupabase) {
      console.log(`Inserting computed properties for node ${nodeId} into DB.`);
      await insertComputedNodeProperties(
        nodeId,
        allComputedProperties,
        serviceRoleSupabase
      );
    }
  }
  return newIntersections;
}
