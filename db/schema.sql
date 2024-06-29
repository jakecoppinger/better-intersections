-- Create a table for public measurements
create table measurements (
  id serial primary key,
  user_id uuid references auth.users not null,
  updated_at timestamp with time zone,
  custom_updated_at text,

  -- Describe the location (road you're crossing & nearest feature, adjacent road if traffic lights, or coordinates)
  location_description text,

  -- How many seconds was the pedestrian light green for?
  green_light_duration real not null,

  -- How many seconds was the pedestrian light flashing red for?
  flashing_red_light_duration real not null,

  -- How many seconds was the pedestrian light solid red for?
  solid_red_light_duration real not null,

  -- Optional: What is the OpenStreetMap node ID of the intersection? (exact crossing node preferable)
  -- TODO: Separate intersection into a different table
  osm_node_id bigint,
  -- What sort of crossing is this?
  crossing_lantern_type text, -- "pedestrian" | "pedestrian_and_bicycle" | "bicycle"
  -- Can cars cross while the light is flashing red? (is the crossing unprotected when flashing red?)
  unprotected_crossing text, -- "yes" | "no" | "delayed" | "not_sure"

  intersection_id text,

  is_scramble_crossing text, -- "yes" | "no" | "unknown"

  has_countdown_timer text, -- "yes" | "no" | "unknown"

  is_two_stage_crossing text, -- "yes" | "no" | "unknown"

  notes text,
  -- latitude & longitude of the node
  latitude float,
  longitude float
);

-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table measurements
  enable row level security;

create policy "Public measurements are visble to everyone."
on measurements for select
using (true);

create policy "Users can insert their own measurement."
on measurements for insert
to authenticated
with check ( (select auth.uid()) = user_id );
-- Cache for properties of an intersection either calculated from measurements, or from other
-- OSM data.
-- Can be wiped at any time. Recomputed by maintenance script.
create table computed_node_properties (
  osm_node_id bigint primary key,

  -- Latitude and longitude of the OSM node
  latitude float not null,
  longitude float not null,

  -- Number of road lanes at the crossing.
  -- If no OSM lanes count tag is present, this property should be set to null
  num_road_lanes int,

  -- If the intersection road is oneway for cars
  -- If no OSM wayway tag is present, this property should be set to false (OSM implied default)
  is_road_oneway boolean,

  average_cycle_time float not null,

  average_total_red_duration float not null,
  average_max_wait float not null,
  human_name text
);

alter table computed_node_properties
  enable row level security;

create policy "Public computed_node_properties are visible to everyone."
on computed_node_properties for select
using ( true );

