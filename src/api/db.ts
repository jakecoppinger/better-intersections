
import { supabase } from "../utils/supabase-client";
import { ComputedNodePropertiesRow, IntersectionMeasurementResult, IntersectionStatsOSMComputed, OSMNode } from "../types";

export async function getIntersectionMeasurements(): Promise<IntersectionMeasurementResult[]> {
  const { data, error } = await supabase
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
 * Set the latitude and longitude of a node in the database.
 */
export async function updateNodeLatLong(nodeId: number, lat: number, lon: number) {
  const { error } = await supabase
    .from('measurements')
    .update({ latitude: lat, longitude: lon})
    .eq('osm_node_id', nodeId)
  
  if (error) {
    throw new Error(`Error updating db for node ${nodeId}: ${error}`);
  }
}

/**
 * Fetch row from the DB.
 * If row does not exist for the given nodeId, returns undefined.
 */
export async function fetchComputedNodeProperties(nodeId: number): Promise<ComputedNodePropertiesRow | undefined> {
  const { data, error } = await supabase
    .from('computed_node_properties')
    .select('osm_node_id,num_road_lanes')
    // .select('osm_node_id,num_road_lanes,is_road_oneway')
    .eq('osm_node_id', nodeId)
  
  if (error) {
    throw error;
  }
  if(data.length !== 1) {
    return undefined;
  }
  return data[0];
}
export async function updateComputedNodeProperties(nodeId: number, properties: IntersectionStatsOSMComputed): Promise<void> {
  const { error } = await supabase
    .from('computed_node_properties')
    .update({
      osm_node_id: nodeId,
      num_road_lanes: properties.numRoadLanes, 
      // is_road_oneway: properties.isRoadOneway
    })
    .eq('osm_node_id', nodeId)
  
  if (error) {
    throw new Error(`Error updating computed node properties DB for node ${nodeId}: ${error}`);
  }
  console.log("updated DB with computed node stats");
  return;
}