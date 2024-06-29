import { supabase as webSupabase } from "../utils/supabase-client";
import {
  ComputedNodePropertiesRow,
  IntersectionMeasurementResult,
} from "../types";
import { SupabaseClient } from "@supabase/supabase-js";

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
  return data;
}


/**
 * Fetch row from the DB.
 * If row does not exist for the given nodeId, returns undefined.
 */
export async function fetchComputedNodeProperties(
  nodeId: number
): Promise<ComputedNodePropertiesRow | undefined> {
  const { data, error } = await webSupabase
    .from("computed_node_properties")
    .select("osm_node_id,num_road_lanes,latitude,longitude,is_road_oneway")
    .eq("osm_node_id", nodeId);

  if (error) {
    throw error;
  }
  if (data.length !== 1) {
    return undefined;
  }
  return data[0];
}
/**
 * This function can only be run by an admin user locally - it will fail on web builds due to RLS.
 */
export async function insertComputedNodeProperties(
  properties: ComputedNodePropertiesRow,
  serviceRoleSupabase: SupabaseClient
): Promise<void> {
  const { error } = await serviceRoleSupabase
    .from("computed_node_properties")
    .insert({
      ...properties,
    });

  if (error) {
    throw new Error(
      `Error inserting computed node properties DB for node ${
        properties.osm_node_id
      }: ${JSON.stringify(error)}`
    );
  }
  return;
}
