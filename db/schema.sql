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

  notes text
);
-- Set up Row Level Security (RLS)
-- See https://supabase.com/docs/guides/auth/row-level-security for more details.
alter table measurements
  enable row level security;

create policy "Public measurements are viewable by everyone." on measurements
  for select using (true);

create policy "Users can insert their own measurement." on measurements
  for insert with check (auth.uid() = id);

create policy "Users can update own measurement." on measurements
  for update using (auth.uid() = id);
