import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";
import { computedNodeProperties } from "./utils/computed-node-properties";
import { getIntersections, getMainWayForIntersection } from "./utils/utils";
import { fetchOsmWaysForNode } from "./api/osm";

/** This key should never be be publicly accessible. */
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;
if (serviceRoleKey === undefined || serviceRoleKey === "") {
  throw new Error("SERVICE_ROLE_KEY env var is not set");
}

export const serviceRoleSupabase = createClient(supabaseUrl, serviceRoleKey);

async function updateComputedNodeProperties() {
  const intersections = (await getIntersections());
  // const intersections = (await getIntersections()).slice(0, 3);
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

  // const ways = await fetchOsmWaysForNode(9791717679);
  // const mainWay = getMainWayForIntersection(ways);
  // console.log({ ways, mainWay });


  console.log("done!");
}

main();

process.on('uncaughtException', (err) => {
  console.log(`Uncaught Exception: ${err}, ${JSON.stringify(err)}`);
  process.exit(1);
});
process.on('unhandledRejection', err => {
  console.log(`Unhandled Rejection: ${err}, ${JSON.stringify(err)}`);
  throw err;
});