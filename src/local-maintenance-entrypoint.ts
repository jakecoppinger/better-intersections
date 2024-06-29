import { createClient } from "@supabase/supabase-js";
import { supabaseUrl } from "./config";
import { computedNodeProperties } from "./utils/computed-node-properties";
import { getIntersections} from "./utils/utils";
import { decorateIntersectionsWithCouncilName } from "./utils/council-calculations";

/** This key should never be be publicly accessible. */
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;
if (serviceRoleKey === undefined || serviceRoleKey === "") {
  throw new Error("SERVICE_ROLE_KEY env var is not set");
}

export const serviceRoleSupabase = createClient(supabaseUrl, serviceRoleKey);

async function updateComputedNodeProperties() {
  // const intersections = (await getIntersections());
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

  // DEBUG!
  // const intersections = (await getIntersections());
  // const output = await decorateIntersectionsWithCouncilName(intersections);
  // console.log(output.filter((x) => x.councilName !== undefined));

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