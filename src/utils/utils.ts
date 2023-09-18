import { getIntersectionMeasurements } from "../api/db";
import { getOsmNodePosition } from "../api/osm";
import { IntersectionStats, OsmWayKeys, RawTag, SQLIntersectionWithId, TrafficLightReport, Way } from "../types";


function isStringInteger(str: string): boolean {
  const num = Number(str);
  return !isNaN(num) && parseInt(str, 10) === num;
}

/** Returns true if the form response has an OpenStreetMap node id, and so can be displayed */
export function isValidTrafficLightReport(formResponse: SQLIntersectionWithId): boolean {
  const rawOsmId = formResponse.osm_node_id;
  return rawOsmId !== null;
}

export async function convertToTrafficLightReport(formResponse: SQLIntersectionWithId): Promise<TrafficLightReport> {
  const { osm_node_id, custom_updated_at, protected_crossing,
    green_light_duration,
    flashing_red_light_duration,
    solid_red_light_duration,
    notes,
    updated_at
  } = formResponse;

  /** May be empty string */
  const timestampOverride = custom_updated_at;
  const unprotectedOnFlashingRed = protected_crossing === "yes" ? true : (protected_crossing === "no" ? false : null);

  if (osm_node_id === null) {
    throw new Error(`No osm id in field: ${osm_node_id}`);
  }
  // TODO: We shouldn't hit OSM API on first paint of the pins
  const { lat, lon, tags } = await getOsmNodePosition(osm_node_id)
  const val = {
    osmId: osm_node_id,
    lat: lat,
    lon: lon,
    greenDuration: green_light_duration,
    flashingDuration: flashing_red_light_duration,
    redDuration: solid_red_light_duration,
    notes: notes || undefined,
    timestamp: timestampOverride && timestampOverride.length > 0 ? timestampOverride : updated_at,
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

export async function getIntersections(): Promise<IntersectionStats[]> {
  let data: SQLIntersectionWithId[] = []
  try {
    data = await getIntersectionMeasurements();
  } catch (e) {
    // TODO: Adding logging
    alert('Unable to fetch intersection measurements. Please try again later or contact Jake.');
    console.log(e);
    return [];
  }
  const safeData = data.filter(measurement => measurement.osm_node_id);

  try {
    const reports: TrafficLightReport[] = await Promise.all(
      safeData
        .filter(isValidTrafficLightReport)
        .map(convertToTrafficLightReport)
    );
    const intersections: IntersectionStats[] =
      summariseReportsByIntersection(reports);
    return intersections;
  } catch (e) {
    // TODO: Adding logging to DB
    alert('Unable to fetch intersection positions. Please try again later or contact Jake.');
    console.log(e);
    return [];
  }
}