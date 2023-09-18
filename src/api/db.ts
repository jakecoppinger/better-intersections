
import { supabase } from "../utils/supabase-client";
import { SQLIntersectionWithId } from "../types";

export async function getIntersectionMeasurements(): Promise<SQLIntersectionWithId[]> {
  const { data, error } = await supabase
    .from("measurements")
    .select(
      `id,user_id,updated_at,location_description,green_light_duration,flashing_red_light_duration,solid_red_light_duration,osm_node_id,crossing_lantern_type,can_cars_cross_while_flashing_red,intersection_id,is_scramble_crossing,has_countdown_timer,notes`
    );

  if (error) {
    throw error;
  }
  return data;
}
