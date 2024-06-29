import { createClient } from '@supabase/supabase-js'
import { insertComputedNodeProperties } from './api/db';
import { supabaseUrl } from './config';

/** This key should never be be publicly accessible. */
const serviceRoleKey = process.env.SERVICE_ROLE_KEY;
if(serviceRoleKey === undefined || serviceRoleKey === '') {
  throw new Error('SERVICE_ROLE_KEY env var is not set');
}

export const serviceRoleSupabase = createClient(supabaseUrl, serviceRoleKey)

async function main() {
  console.log('Starting...');

  await insertComputedNodeProperties({
    osm_node_id: 6936407757,
    num_road_lanes: 99,
    latitude: 99,
    longitude: 99,
    is_road_oneway: false,
  }, serviceRoleSupabase);
  console.log('done!');
}

main();
