export interface FormResponse {
  Timestamp: string;
  "Email Address": string;
  Score: string;
  "Optional: What time (to the nearest 15 min) did you measure this?\nIf not specified assumes current time.": string;
  "Optional: What code is on the traffic light control box?\nUsually a number on yellow background, on a metal box near the intersection.": string;
  "Describe the location (road you're crossing & nearest feature, adjacent road if traffic lights, or coordinates)": string;
  "What is the name of the road parallel to you (if at traffic lights) or another landmark if a mid block crossing?": string;
  "How many seconds was the pedestrian light green for?": string;
  "How many seconds was the pedestrian light flashing red for?": string;
  "How many seconds was the pedestrian light solid red for?": string;
  "Optional: What is the OpenStreetMap node ID of the intersection? (exact crossing node preferable)": string;
  "What sort of crossing is this?": string;
  "Optional: Any other notes or observations?\n(possible improvements)": string;
  "Can cars cross while the light is flashing red? (is the crossing unprotected when flashing red?)":
    | "Yes"
    | "No"
    | "";
}

export interface TrafficLightReport {
  /** Timestamp of the Google Form submission, or timestamp given if provided */
  timestamp: Date | string;
  /** OpenStreetMap node ID of the intersection */
  osmId: number;
  lat: number;
  lon: number;
  /** How long is the traffic light solid green for */
  greenDuration: number;
  /** How long is the traffic flashing red/orange countdown/flashing orange (bicycle lanterns) for */
  flashingDuration: number;
  /** How long is the traffic light solid red for until the next green light*/
  redDuration: number;
  notes?: string;
  /** Derived field. Length of full cycle */
  cycleLength: number;
  /** Is the crossing unprotected when flashing red? Boolean or null when unknown */
  unprotectedOnFlashingRed: boolean | null;
}

export interface IntersectionStats {
  /** OpenStreetMap node ID of the intersection */
  osmId: number;
  lat: number;
  lon: number;
  reports: TrafficLightReport[];
}

export interface Way {
  id: string;
  timestamp: string;
  tags: Record<OsmWayKeys, string>;
}

// Any key in OSM spec - very vague here
export type OsmWayKeys =
  | "busway"
  | "cycleway"
  | "highway"
  | "lanes"
  | "maxspeed"
  | "name"
  | "oneway"
  | "sidewalk"
  | "source"
  | "surface";

export interface RawWayObject {
  $: {
    changeset: string;
  };
}

export interface RawTag {
  $: {
    k: OsmWayKeys;
    v: "no";
  };
}
/**
 * Object to store the current filter state
 */
export interface IntersectionFilterState {
  /** Minimum cycle time to show on the map */
  min: number;

  /** Maximum cycle time to show on the map */
  max: number;
}

export type DisplayMode = "avg_cycle_time" | "max_ped_wait_time";
export interface DisplayModeState {
  /**
   * When avg_cycle_time, the map will display colours based on the average cycle time of
   * the intersection.
   * When max_ped_wait_time, the map will display colours based on the maximum pedestrian
   * wait time (red + flashing red).
   */
  displayMode: DisplayMode;
}

export type CrossingLanternType =
  | "pedestrian"
  | "pedestrian_and_bicycle"
  | "bicycle";
export type UnprotectedCrossing = "yes" | "no" | "delayed" | "not_sure";
export type IsScrambleCrossing = "yes" | "no" | "unknown";
export type IsTwoStageCrossing = "yes" | "no" | "unknown";
export type HasCountdownTimer = "yes" | "no" | "unknown";

export interface IntersectionForm {
  // /** UUID references auth.users on delete cascade. */
  // id: string;

  // /** Timestamp with time zone. */
  // updated_at: Date;

  custom_updated_at: string | null;
  /**
   * Describe the location (road you're crossing & nearest feature,
   * adjacent road if traffic lights, or coordinates).
   */
  location_description: string | null;

  /** How many seconds was the pedestrian light green for? */
  green_light_duration: number;

  /** How many seconds was the pedestrian light flashing red for? */
  flashing_red_light_duration: number;

  /** How many seconds was the pedestrian light solid red for? */
  solid_red_light_duration: number;

  /**
   * Optional: What is the OpenStreetMap node ID of the intersection?
   * (exact crossing node preferable).
   * TODO: Separate intersection into a different table.
   */
  osm_node_id: number | null;

  /** What sort of crossing is this? */
  crossing_lantern_type: CrossingLanternType;

  /**
   * Can cars cross while the light is flashing red?
   * (is the crossing unprotected when flashing red?)
   */
  unprotected_crossing: UnprotectedCrossing;

  /** Intersection ID. */
  intersection_id: string | null;

  /** Is it a scramble crossing? */
  is_scramble_crossing: IsScrambleCrossing | null;

  /** Is it a two stage crossing? */
  is_two_stage_crossing: IsTwoStageCrossing | null;

  has_countdown_timer: HasCountdownTimer | null;

  /** Additional notes. */
  notes: string | null;

  /** Latitude and Longitude of the measurement, fetched from OSM. */
  latitude: number | null;
  longitude: number | null;
}

/** The fields needed to create a new intersection measurement */
export interface IntersectionInsertionFields extends IntersectionForm {
  /** Which user submitted this measurement. Using string for uuid */
  user_id: string;
  /** timestamp with time zone is mapped to JavaScript's Date */
  updated_at: Date;
}

/** The fields returned from the database */
export interface IntersectionMeasurementResult extends IntersectionForm {
  /** Unique serial id of intersection measurement */
  id: string;
  /** timestamp with time zone is mapped to JavaScript's Date */
  updated_at: Date;
}
export interface RawOSMCrossing {
  type: "node",
  id: number,
  lat: number,
  lon: number,
  // tags: {
  // },
}
export interface OSMWay {
  type: "way",
  id: number,
  nodes: number[],
  geometry: { lat: number, lon: number }[],
  tags: {
    highway?: string,
    maxspeed?: string,
    lanes?: string,
    lit?: string,
    name?: string,
    oneway?: string,
    sidewalk?: string,
    source?: string,
    width?: string,
    bicycle?: string,
    surface?: string,
    opening_date?: string,
  },

  bounds: {
    minlat: number,
    minlon: number,
    maxlat: number,
    maxlon: number,
  }
}

export interface OSMRelation {
  type: "relation",
  id: number,
  tags: {
    name?: string,
    ["name:en"]?: string,
    type?: string,
    boundary?: string,
    admin_level?: string,
    ref?: string,
    place?: string,
    source?: string,
    wikidata?: string,
    wikipedia?: string,
  },
}
export interface OSMNode {
  type: "node",
  /** todo. is it string? */
  id: number,
  lat: number,
  lon: number,
  tags: Record<string, string>;
}

export interface ComputedNodeProperties {
  osmId: number;

  latitude: number;
  longitude: number;

  numRoadLanes: number | null;
  isRoadOneway: boolean;

  averageCycleTime: number;
  averageGreenDuration: number;
  averageFlashingRedDuration: number;
  averageFlashingAndSolidRedDuration: number;
  averageSolidRedDuration: number;
  cycleTimeMaxDifference: number;

  humanName: string | null;
  councilName: string | null;
  isNSWStateRoad: boolean | null;
  osmHighwayClassification: string | null;
  roadMaxSpeed: number | null;
}
export interface IntersectionStatsWithComputed extends IntersectionStats {
  latitude: number;
  longitude: number;

  numRoadLanes: number | null;
  isRoadOneway: boolean;

  averageCycleTime: number;
  averageGreenDuration: number;
  averageFlashingRedDuration: number;
  averageFlashingAndSolidRedDuration: number;
  averageSolidRedDuration: number;
  cycleTimeMaxDifference: number;

  humanName: string | null;
  councilName: string | null;
  isNSWStateRoad: boolean | null;
  osmHighwayClassification: string | null;
  roadMaxSpeed: number | null;
}

/** The fields returned from the database */
export interface ComputedNodePropertiesRow {
  osm_node_id: number;
  latitude: number;
  longitude: number;
  num_road_lanes: number | null;
  is_road_oneway: boolean;

  average_cycle_time: number;
  average_green_duration: number,
  average_flashing_red_duration: number;
  average_flashing_and_solid_red_duration: number;
  average_solid_red_duration: number;
  cycle_time_max_difference: number;

  human_name: string | null;
  council_name: string | null;
  is_nsw_state_road: boolean | null;
  osm_highway_classification: string | null;
  road_max_speed: number | null;
}
