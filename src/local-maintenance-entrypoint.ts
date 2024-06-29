import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";
import { computedNodeProperties } from "./utils/computed-node-properties";
import { getIntersections } from "./utils/utils";

/** This key should never be be publicly accessible. */
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;
if (serviceRoleKey === undefined || serviceRoleKey === "") {
  throw new Error("SERVICE_ROLE_KEY env var is not set");
}

export const serviceRoleSupabase = createClient(supabaseUrl, serviceRoleKey);

/**
 * This function:
 * - Iterates through every OSM node ID in the measurements table
 * - Fetches the OSM properties for each node where unique to the node (eg. lane count)
 * - Generates any computed properties for the node (eg. average cycle time)
 * - Generates any computed properties relying on other OSM relation data (eg. is in City of Sydney?)
 * - Inserts the computed properties into the computed_node_properties table
 */
async function updateComputedNodeProperties() {
  const intersections = (await getIntersections()).slice(0, 3);
  const logProgress = true;
  const richIntersections = await computedNodeProperties(
    intersections,
    logProgress,
    serviceRoleSupabase
  );

  console.log(richIntersections);
}

async function main() {
  console.log("Starting...");
  await updateComputedNodeProperties();

  // await insertComputedNodeProperties({
  //   osm_node_id: 6936407757,
  //   num_road_lanes: 99,
  //   latitude: 99,
  //   longitude: 99,
  //   is_road_oneway: false,
  // }, serviceRoleSupabase);
  console.log("done!");
}

main();
