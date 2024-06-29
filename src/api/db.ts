import { supabase as webSupabase } from "../utils/supabase-client";
import {
  ComputedNodeProperties,
  ComputedNodePropertiesRow,
  IntersectionMeasurementResult,
} from "../types";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Only returns intersections with valid OSM node IDs.
 * @returns
 */
export async function getIntersectionMeasurements(): Promise<
  IntersectionMeasurementResult[]
> {
  const { data, error } = await webSupabase
    .from("measurements")
    // user_id is not excluded here for security reasons -
    // user_id references a record in the (locked down) auth table
    .select(
      `id,updated_at,custom_updated_at,location_description,green_light_duration,flashing_red_light_duration,solid_red_light_duration,osm_node_id,crossing_lantern_type,unprotected_crossing,intersection_id,is_scramble_crossing,is_two_stage_crossing,has_countdown_timer,notes,longitude,latitude`
    );

  if (error) {
    throw error;
  }
  return data.filter((formResponse) => formResponse.osm_node_id !== null);
}

/**
 * Fetch row from the DB.
 * If row does not exist for the given nodeId, returns undefined.
 */
export async function fetchComputedNodeProperties(
  nodeId: number
): Promise<ComputedNodeProperties | undefined> {
  const { data, error } = await webSupabase
    .from("computed_node_properties")
    .select(
      "osm_node_id,num_road_lanes,latitude,longitude,is_road_oneway,average_max_cycle_time,average_total_red_duration,average_max_wait"
    )
    .eq("osm_node_id", nodeId);

  if (error) {
    throw error;
  }
  if (data.length !== 1) {
    return undefined;
  }
  const row = data[0];

  const renamedRow: ComputedNodeProperties = {
    osmId: row.osm_node_id,
    numRoadLanes: row.num_road_lanes,
    latitude: row.latitude,
    longitude: row.longitude,
    isRoadOneway: row.is_road_oneway,
    averageMaxCycleTime: row.average_max_cycle_time,
    averageTotalRedDuration: row.average_total_red_duration,
    averageMaxWait: row.average_max_wait,
  };

  return renamedRow;
}
/**
 * This function can only be run by an admin user locally - it will fail on web builds due to RLS.
 */
export async function insertComputedNodeProperties(
  osmNode: number,
  properties: ComputedNodeProperties,
  serviceRoleSupabase: SupabaseClient
): Promise<void> {
  const rowProperties: ComputedNodePropertiesRow = {
    osm_node_id: osmNode,
    num_road_lanes: properties.numRoadLanes,
    latitude: properties.latitude,
    longitude: properties.longitude,
    is_road_oneway: properties.isRoadOneway,
    average_max_cycle_time: properties.averageMaxCycleTime,
    average_total_red_duration: properties.averageTotalRedDuration,
    average_max_wait: properties.averageMaxWait,
  };
  const { error } = await serviceRoleSupabase
    .from("computed_node_properties")
    .insert({
      ...rowProperties,
    });

  if (error) {
    throw new Error(
      `Error inserting computed node properties DB for node ${osmNode}: ${JSON.stringify(
        error
      )}`
    );
  }
  return;
}

/**
 * Fetch all the cached node properties from the DB at once.
 */
export async function fetchAllCachedNodeProperties(): Promise<
  ComputedNodeProperties[]
> {
  /**
   * Map from the DB schema fields to the TypeScript interface.
   */
  function mapComputedNodeRowToProperties(
    row: ComputedNodePropertiesRow
  ): ComputedNodeProperties {
    return {
      osmId: row.osm_node_id,
      numRoadLanes: row.num_road_lanes,
      latitude: row.latitude,
      longitude: row.longitude,
      isRoadOneway: row.is_road_oneway,
      averageMaxCycleTime: row.average_max_cycle_time,
      averageTotalRedDuration: row.average_total_red_duration,
      averageMaxWait: row.average_max_wait,
    };
  }
  const { data, error } = await webSupabase
    .from("computed_node_properties")
    .select(
      "osm_node_id,num_road_lanes,latitude,longitude,is_road_oneway,average_max_cycle_time,average_total_red_duration,average_max_wait"
    );

  if (error) {
    throw error;
  }
  if (!data) {
    throw new Error(
      "No cached node properties (not even empty array) returned from DB."
    );
  }
  return data.map(mapComputedNodeRowToProperties);
}
