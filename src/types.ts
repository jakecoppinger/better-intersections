export interface FormResponse {
  "Timestamp": string,
  "Email Address": string,
  "Score": string,
  "Optional: What time (to the nearest 15 min) did you measure this?\nIf not specified assumes current time.": string,
  "Optional: What code is on the traffic light control box?\nUsually a number on yellow background, on a metal box near the intersection.": string,
  "Describe the location (road you're crossing & nearest feature, adjacent road if traffic lights, or coordinates)": string,
  "What is the name of the road parallel to you (if at traffic lights) or another landmark if a mid block crossing?": string,
  "How many seconds was the pedestrian light green for?": string,
  "How many seconds was the pedestrian light flashing red for?": string,
  "How many seconds was the pedestrian light solid red for?": string,
  "Optional: What is the OpenStreetMap node ID of the intersection? (exact crossing node preferable)": string,
  "What sort of crossing is this?": string,
  "Optional: Any other notes or observations?\n(possible improvements)": string,
  "Can cars cross while the light is flashing red? (is the crossing unprotected when flashing red?)": "Yes" | "No" | ""
}

export interface TrafficLightReport {
  /** Timestamp of the Google Form submission, or timestamp given if provided */
  timestamp: string;
  /** OpenStreetMap node ID of the intersection */
  osmId: string;
  lat: number;
  lon: number;
  /** How long is the traffic light solid green for */
  greenDuration: number,
  /** How long is the traffic flashing red/orange countdown/flashing orange (bicycle lanterns) for */
  flashingDuration: number,
  /** How long is the traffic light solid red for until the next green light*/
  redDuration: number,
  notes?: string,
  /** Derived field. Length of full cycle */
  cycleLength: number,
  /** OSM tags on the intersection node */
  tags: Record<string, string>
  /** Is the crossing unprotected when flashing red? Boolean or null when unknown */
  unprotectedOnFlashingRed: boolean | null
}


export interface IntersectionStats {
  /** OpenStreetMap node ID of the intersection */
  osmId: string;
  lat: number,
  lon: number,
  reports: TrafficLightReport[];
  /** OSM tags for the intersection */
  tags: Record<string, string>;
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