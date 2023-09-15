import { getOsmNodePosition } from "../api/osm";
import { FormResponse, IntersectionStats, OsmWayKeys, RawTag, TrafficLightReport, Way } from "../types";

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
  const rawUnprotectedOnFlashingRed = formResponse["Can cars cross while the light is flashing red? (is the crossing unprotected when flashing red?)"]
  const unprotectedOnFlashingRed = rawUnprotectedOnFlashingRed === "Yes" ? true : (rawUnprotectedOnFlashingRed === "No" ? false : null);

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
    tags: tags,
    unprotectedOnFlashingRed,
  }
  const cycleLength = val.greenDuration + val.flashingDuration + val.redDuration;

  return { ...val, cycleLength };
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

export function averageIntersectionTotalRedDuration(intersection: IntersectionStats): number {
  const totalCycleTime = intersection.reports.reduce((acc, report) => acc + report.cycleLength, 0);
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

/*
Returns colour for markers based on average cycle time
if time > 150, returns black 
else returns a gradient between green and red
*/
export function getMarkerColour(avgCycleLegth: number): string {

  if (avgCycleLegth >= 150) {
    return 'hsl(0deg 0% 0%)';
  }

  let hueVal: number = 120 - avgCycleLegth;
  let colour: string = '';

  if (hueVal < 0) {
    let lightness: number = 50 - (hueVal * -1);
    colour = `hsl(0deg 100% ${lightness}%)`;

  } else {
    colour = `hsl(${hueVal}deg 100% 50%)`;
  }

  return colour;
}

export function getMainWayForIntersection(ways: Way[]): Way {
  // Usually 2 ways left after filtering out footpaths
  const adjacentRoad = ways[0];
  return adjacentRoad;
}

export function filterOutNonRoadWays(ways: Way[]): Way[] {
  return ways.filter(
    (way) => way.tags.highway !== "footway" && way.tags.highway !== "cycleway"
  );
}

/** Calculate average of an array */
const average = (array: number[]) => array.reduce((a, b) => a + b) / array.length;

/**
  * Iterate over all intersections, and find the highest *average* cycle times across
  * all intersections.
  * Returns undefined if no intersections have been measured.
  */
export function getMaxCycleTime(intersections: IntersectionStats[]): number | undefined {
  return intersections.reduce<number | undefined>((acc, value) => {
    const measuredCycleLengths = value.reports.map(x => x.cycleLength);
    const avgCycleLength = average(measuredCycleLengths);
    if (!acc) {
      return avgCycleLength;
    }
    if (avgCycleLength > acc) {
      return avgCycleLength;
    }
    return acc;
  }, undefined);
}

export function getNextLargestMultipleOf5(val: number) {
  return Math.ceil(val / 5) * 5;
}
