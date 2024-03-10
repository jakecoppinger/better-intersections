
import { supabase } from "../utils/supabase-client";
import { IntersectionMeasurementResult, OSMNode } from "../types";

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