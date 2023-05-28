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
}

export interface TrafficLightReport {
  timestamp: string;
  osmId: string;
  lat: number;
  lon: number;
  greenDuration: number,
  flashingDuration: number,
  redDuration: number,
  notes?: string,
  /** Derived field */
  cycleTime: number,
}