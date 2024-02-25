import { getIntersectionMeasurements } from "../api/db";
import { getOsmNodePosition, logOSMCacheStats, requestOsmNodePosition } from "../api/osm";
import { IntersectionStats, OsmWayKeys, RawTag, IntersectionMeasurementResult, TrafficLightReport, Way, OSMNode } from "../types";


function isStringInteger(str: string): boolean {
  const num = Number(str);
  return !isNaN(num) && parseInt(str, 10) === num;
}

/** Returns true if the form response has an OpenStreetMap node id, and so can be displayed */
export function isValidTrafficLightReport(formResponse: IntersectionMeasurementResult): boolean {
  const rawOsmId = formResponse.osm_node_id;
  return rawOsmId !== null;
}

export async function convertToTrafficLightReport(formResponse: IntersectionMeasurementResult): Promise<TrafficLightReport | null> {
  const { osm_node_id, custom_updated_at, unprotected_crossing,
    green_light_duration,
    flashing_red_light_duration,
    solid_red_light_duration,
    notes,
    updated_at
  } = formResponse;

  /** May be empty string */
  const timestampOverride = custom_updated_at;
  const unprotectedOnFlashingRed = unprotected_crossing === "yes" ? true : (unprotected_crossing === "no" ? false : null);

  if (osm_node_id === null) {
    throw new Error(`No osm id in field: ${osm_node_id}`);
  }
  try {
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
  } catch (e) {
    console.log(e);
    return null;
  }
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

export function averageIntersectionMaxWait(intersection: IntersectionStats): number {
  return intersection
    .reports
    .reduce((acc, report) => acc + report.redDuration + report.flashingDuration, 0)
    / intersection.reports.length;
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

export function getMaxWaitMarkerColour(maxWait: number): string {
  if (maxWait > 45) {
    return 'red';
  }
  if (maxWait <= 30) {
    return 'green';
  }
  return 'orange';
}
/*
Returns colour for markers based on average cycle time
if time > 150, returns black 
else returns a gradient between green and red
*/
export function getCycleTimeMarkerColour(avgCycleLegth: number): string {

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

/**
 * Takes in unfiltered list of ways and returns the most relevent named main road for the intersection
 * If there is a non-footway, non-cycleway road with a name, it is returned.
 * Otherwise, if there is an adjacent cycleway with a name it is returned
 * Otherwise, if there is an adjacent footway with a name it is returned
 * Otherwise returns null.
 */
export function getMainWayForIntersection(ways: Way[]): Way | null {
  const waysWithNames = filterOutWaysWithoutName(ways);
  const cycleways = filterOnlyCycleways(waysWithNames);
  const nonRoadWays = filterOutNonRoadWays(waysWithNames);

  if (nonRoadWays.length > 0) {
    return nonRoadWays[0];
  }

  if (cycleways.length > 0) {
    return cycleways[0];
  }
  if (waysWithNames.length > 0) {
    return waysWithNames[0];
  }
  return null;
}

export function filterOutNonRoadWays(ways: Way[]): Way[] {
  return ways.filter(
    (way) => way.tags.highway !== "footway" && way.tags.highway !== "cycleway"
  );
}
export function filterOutWaysWithoutName(ways: Way[]): Way[] {
  return ways.filter((way) => way.tags.name);
}
export function filterOnlyCycleways(ways: Way[]): Way[] {
  return ways.filter((way) => way.tags.highway === "cycleway");
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
  let data: IntersectionMeasurementResult[] = []
  try {
    data = await getIntersectionMeasurements();
  } catch (e) {
    // TODO: Adding logging
    alert('Unable to fetch intersection measurements. Please try again later or contact Jake.');
    console.log(e);
    return [];
  }
  const safeData = data.filter(measurement => measurement.osm_node_id);

  // Turn this on if you want to generate a new cache!
  const generateOsmCache = false;
  if (generateOsmCache) {
    const cache: Record<string, OSMNode> = {};
    const disappearedOSMNodes: number[] = [];
    const osmNodes: number[] = safeData
      .filter(measurement => measurement.osm_node_id)
      .map(measurement => measurement.osm_node_id as number);

    await Promise.all(osmNodes.map(async (osmNode) => {
      try {
        // requestOsmNodePosition doesn't hit the cache - we want fresh data
        const node = await requestOsmNodePosition(osmNode);
        cache[osmNode.toString()] = node;
      } catch (e) {
        // @ts-ignore
        if (e.toString().includes('410')) {
          disappearedOSMNodes.push(osmNode);
        } else {
          throw new Error(`Couldn't fetch node ${osmNode}: ${e}`);
        }
      }
    }));

    console.log(JSON.stringify(cache));
    console.log('put above JSON into osm-cache.json :)');
    console.log(`${osmNodes.length} nodes input, ${Object.keys(cache).length} nodes output. ${disappearedOSMNodes.length} nodes disappeared.`);
    console.log(`Disappeared nodes: ${disappearedOSMNodes.join(', ')}`);
  }

  try {
    const reportsOrNull: (TrafficLightReport | null)[] = await Promise.all(
      safeData
        .filter(isValidTrafficLightReport)
        .map(convertToTrafficLightReport)
    );
    logOSMCacheStats();

    const reports: TrafficLightReport[] = reportsOrNull.filter(
      (report): report is TrafficLightReport => report !== null);

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

/** 
 * Formats UTC time (or any ISO8601 date string) into the browsers local timezone.
 * If date is invalid, returns the original string.
 */
export function convertUTCtoLocal(UTCtime: string): string {
  const dateObject = new Date(UTCtime);
  const localTime = dateObject.toString();

  if (localTime === "Invalid Date") {
    return UTCtime;
  } else {
    return localTime;
  }
}
