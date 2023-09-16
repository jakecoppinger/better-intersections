-- Create a table for public measurements
create table measurements (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,

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
  osm_node_id integer,
  -- What sort of crossing is this?
  crossing_lantern_type text, -- "pedestrian" | "pedestrian_and_bicycle" | "bicycle"
  -- Can cars cross while the light is flashing red? (is the crossing unprotected when flashing red?)
  can_cars_cross_while_flashing_red text, -- "yes" | "no" | "delayed" | "not_sure"

  intersection_id text,

  is_scramble_crossing text, -- "yes" | "no" | "unknown"

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

-- This trigger automatically creates a profile entry when a new user signs up via Supabase Auth.
-- See https://supabase.com/docs/guides/auth/managing-user-data#using-triggers for more details.


create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.measurements (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
