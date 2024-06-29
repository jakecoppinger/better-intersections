import {
  fetchComputedNodeProperties,
  insertComputedNodeProperties,
} from "../api/db";
import { fetchOsmWaysForNode, requestOsmNodePosition } from "../api/osm";
import {
  ComputedNodeProperties,
  IntersectionStats,
  IntersectionStatsWithComputed,
} from "../types";
import { getMainWayForIntersection } from "./utils";
import {
  calculateAverageIntersectionMaxWait,
  calculateAverageIntersectionTotalRedDuration,
  calculateIntersectionAverageCycleTime,
} from "./intersection-computed-properties";
import { SupabaseClient } from "@supabase/supabase-js";

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
  const osmNodeIds = intersections.map((intersection) => intersection.osmId);
  const newIntersections: IntersectionStatsWithComputed[] = [];

  // We intentionally want to do this in serial to avoid hitting OSM API all at once
  for (let i = 0; i < osmNodeIds.length; i++) {
    const nodeId: number = osmNodeIds[i];

    const maybeExistingComputedProperties = await fetchComputedNodeProperties(
      nodeId
    );
    // If we have the computed properties cached, use them
    if (maybeExistingComputedProperties !== undefined) {
      newIntersections.push({
        ...intersections[i],
        ...maybeExistingComputedProperties,
      });
      if (logProgress) {
        console.log(
          `Found existing computed properties for node ${nodeId} in cache.`
        );
      }
      continue;
    }
    console.log(`Cache miss for node ${nodeId}. Fetching from OSM API.`);

    const intersection: IntersectionStats = intersections[i];
    const ways = await fetchOsmWaysForNode(nodeId);

    // Generate computed properties
    const { lat: latitude, lon: longitude } = await requestOsmNodePosition(
      nodeId
    );
    const averageTotalRedDuration =
      calculateAverageIntersectionTotalRedDuration(intersection);

    const averageMaxWait = calculateAverageIntersectionMaxWait(intersection);
    const averageMaxCycleTime =
      calculateIntersectionAverageCycleTime(intersection);

    const mainWay = getMainWayForIntersection(ways);

    // TODO: Add error handling if num lanes is not an integer
    const numRoadLanes = mainWay ? parseInt(mainWay.tags.lanes) : null;
    const isRoadOneway = mainWay ? mainWay.tags.oneway === "yes" : false;

    const allComputedProperties: ComputedNodeProperties = {
      latitude,
      longitude,
      averageTotalRedDuration,
      averageMaxWait,
      averageMaxCycleTime,
      numRoadLanes,
      isRoadOneway,
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
