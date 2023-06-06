import { getOsmNodePosition } from "../api/osm";
import { FormResponse, IntersectionStats, OsmWayKeys, RawTag, TrafficLightReport } from "../types";

function isStringInteger(str: string): boolean {
  const num = Number(str);
  return !isNaN(num) && parseInt(str, 10) === num;
}

/** Returns true if the form response has an OpenStreetMap node id, and so can be displayed */
export function isValidTrafficLightReport(formResponse: FormResponse): boolean {
  const rawOsmId = formResponse["Optional: What is the OpenStreetMap node ID of the intersection? (exact crossing node preferable)"];
  const osmId: number | undefined = rawOsmId && rawOsmId.length > 0 && isStringInteger(rawOsmId) ? Number(rawOsmId) : undefined;
  return osmId !== undefined;
}

export async function convertToTrafficLightReport(formResponse: FormResponse): Promise<TrafficLightReport> {
  const rawOsmId = formResponse["Optional: What is the OpenStreetMap node ID of the intersection? (exact crossing node preferable)"];

  /** May be empty string */
  const timestampOverride: string = formResponse["Optional: What time (to the nearest 15 min) did you measure this?\nIf not specified assumes current time."]

  const osmId: string | undefined = rawOsmId && rawOsmId.length > 0 && isStringInteger(rawOsmId) ? rawOsmId : undefined;
  if (osmId === undefined) {
    throw new Error(`No osm id in field: ${rawOsmId}`);
  }
  const { lat, lon, tags } = await getOsmNodePosition(osmId)
  const val = {
    osmId,
    lat: lat,
    lon: lon,
    greenDuration: parseInt(formResponse["How many seconds was the pedestrian light green for?"]),
    flashingDuration: parseInt(formResponse["How many seconds was the pedestrian light flashing red for?"]),
    redDuration: parseInt(formResponse["How many seconds was the pedestrian light solid red for?"]),
    notes: formResponse["Optional: Any other notes or observations?\n(possible improvements)"],
    timestamp: timestampOverride && timestampOverride.length > 0 ? timestampOverride : formResponse["Timestamp"],
    tags: tags
  }
  const cycleTime = val.greenDuration + val.flashingDuration + val.redDuration;

  return { ...val, cycleTime };
}

export function summariseReportsByIntersection(reports: TrafficLightReport[]): IntersectionStats[] {
  const stats: Record<string, IntersectionStats> = {};
  reports.forEach(report => {
    const existingStats = stats[report.osmId];
    if (existingStats) {
      existingStats.reports.push(report);
    } else {
      stats[report.osmId] = {
        osmId: report.osmId,
        reports: [report],
        tags: report.tags,
        lat: report.lat,
        lon: report.lon,
      }
    }
  });
  return Object.values(stats);
}

export function averageIntersectionCycleTime(intersection: IntersectionStats): number {
  const totalCycleTime = intersection.reports.reduce((acc, report) => acc + report.cycleTime, 0);
  return totalCycleTime / intersection.reports.length;
}

interface MoveEndCallbackProps {
  centre: mapboxgl.LngLat;
  zoom: number;
}

export function moveEndCallback({ centre, zoom }: MoveEndCallbackProps) {
  const { lat, lng } = centre;

  const location = window.location.origin;
  const fractionDigits = 4;

  window.history.pushState(
    {
      id: "homepage",
    },
    "Home | My App",
    `${location}/?lat=${lat.toFixed(fractionDigits)}&lon=${lng.toFixed(fractionDigits)}&zoom=${zoom.toFixed(fractionDigits)}`
  );
}

/*
Turns an array of tags into a record of all key-value pairs contained in the tags
 */
export function tagListToRecord(tagList: RawTag[]): Record<OsmWayKeys, string> {
  const record: Record<OsmWayKeys, string> = {} as Record<OsmWayKeys, string>;
  tagList.forEach((tag: RawTag) => {
    record[tag.$.k] = tag.$.v;
  });
  return record;
}

export function getColourForCycletime(cycleTime: number): string {
  const cycleColourCliffs: { [key: number]: string } = {
    180: "#ff0000",
    160: "#fc4f00",
    120: "#f27600",
    100: "#e29700",
    90: "#cab500",
    60: "#aad000",
    45: "#7de800",
    30: "#00ff00",
  };

  // Cliffs keys sorted low to high
  const cycleColourCliffKeys: number[] = Object.keys(cycleColourCliffs)
    .map((key) => parseInt(key))
    // Sort by smallest to largest number
    .sort((a, b) => a - b);

  // Iterate over the colour cliff keys and to find the smallest one larger than the cycle time
  for (let i = 0; i < cycleColourCliffKeys.length; i++) {
    const key = cycleColourCliffKeys[i];
    if (cycleTime <= key) {
      return cycleColourCliffs[key];
    }
  }
  return 'black';
}