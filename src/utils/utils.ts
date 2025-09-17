import { getIntersectionMeasurements } from "../api/db";
import { getOsmNodePosition, logOSMCacheStats } from "../api/osm";
import {
  IntersectionStats,
  OsmWayKeys,
  RawTag,
  IntersectionMeasurementResult,
  TrafficLightReport,
  Way,
} from "../types";

export function generateOSMNodeUrl(osmId: number): string {
  return `https://www.openstreetmap.org/node/${osmId}`;
}

/** Returns true if the form response has an OpenStreetMap node id, and so can be displayed */
export function isValidTrafficLightReport(
  formResponse: IntersectionMeasurementResult
): boolean {
  const rawOsmId = formResponse.osm_node_id;
  return rawOsmId !== null;
}

export async function convertToTrafficLightReport(
  formResponse: IntersectionMeasurementResult,
  nodeIdLocationLookup: Record<number, { lat: number; lon: number }>
): Promise<TrafficLightReport | null> {
  const {
    osm_node_id,
    custom_updated_at,
    unprotected_crossing,
    green_light_duration,
    flashing_red_light_duration,
    solid_red_light_duration,
    notes,
    updated_at,
  } = formResponse;

  /** May be empty string */
  const timestampOverride = custom_updated_at;
  const unprotectedOnFlashingRed =
    unprotected_crossing === "yes"
      ? true
      : unprotected_crossing === "no"
      ? false
      : null;

  if (osm_node_id === null) {
    throw new Error(`No osm id in field: ${osm_node_id}`);
  }
  try {
    const { lat, lon } = await getOsmNodePosition(
      osm_node_id,
      nodeIdLocationLookup
    );

    const val = {
      osmId: osm_node_id,
      lat: lat,
      lon: lon,
      greenDuration: green_light_duration,
      flashingDuration: flashing_red_light_duration,
      redDuration: solid_red_light_duration,
      notes: notes || undefined,
      timestamp:
        timestampOverride && timestampOverride.length > 0
          ? timestampOverride
          : updated_at,
      unprotectedOnFlashingRed,
    };
    const cycleLength =
      val.greenDuration + val.flashingDuration + val.redDuration;

    return { ...val, cycleLength };
  } catch (e) {
    console.log(e);
    return null;
  }
}

export function summariseReportsByIntersection(
  reports: TrafficLightReport[]
): IntersectionStats[] {
  const stats: Record<string, IntersectionStats> = {};
  reports.forEach((report) => {
    const existingStats = stats[report.osmId];
    if (existingStats) {
      existingStats.reports.push(report);
    } else {
      stats[report.osmId] = {
        osmId: report.osmId,
        reports: [report],
        lat: report.lat,
        lon: report.lon,
      };
    }
  });
  return Object.values(stats);
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
    `${location}/?lat=${lat.toFixed(fractionDigits)}&lon=${lng.toFixed(
      fractionDigits
    )}&zoom=${zoom.toFixed(fractionDigits)}`
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

/**
 * Colour markers as green / orange / red based on the max pedestrian wait time
 * as per City of Sydney strategy
 */
export function getMaxWaitMarkerColour({maxWait }: {maxWait: number}): string {
  if (maxWait > 45) {
    return "red";
  }
  if (maxWait < 35) {
    return "green";
  }
  return "orange";
}
/*
Returns colour for markers based on average cycle time
if time > 150, returns black 
else returns a gradient between green and red
*/
export function getCycleTimeMarkerColour(avgCycleLegth: number): string {
  if (avgCycleLegth >= 150) {
    return "hsl(0deg 0% 0%)";
  }

  let hueVal: number = 120 - avgCycleLegth;
  let colour: string = "";

  if (hueVal < 0) {
    let lightness: number = 50 - hueVal * -1;
    colour = `hsl(0deg 100% ${lightness}%)`;
  } else {
    colour = `hsl(${hueVal}deg 100% 50%)`;
  }

  return colour;
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
const average = (array: number[]) =>
  array.reduce((a, b) => a + b) / array.length;

/**
 * Iterate over all intersections, and find the highest *average* cycle times across
 * all intersections.
 * Returns undefined if no intersections have been measured.
 */
export function getMaxCycleTime(
  intersections: IntersectionStats[]
): number | undefined {
  return intersections.reduce<number | undefined>((acc, value) => {
    const measuredCycleLengths = value.reports.map((x) => x.cycleLength);
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

/**
 * Generates a record mapping node IDs to an object containing their latitude and longitude
 */
export function buildNodeIdLocationLookup(
  measurements: IntersectionMeasurementResult[]
): Record<number, { lat: number; lon: number }> {
  const lookup: Record<string, { lat: number; lon: number }> = {};
  /** measurements sorted by time, so that we preserve the most recent coordinate of an OSM node */
  const sortedMeasurements = measurements.sort((a, b) => {
    const aTime = new Date(a.updated_at).getTime();
    const bTime = new Date(b.updated_at).getTime();
    return bTime - aTime;
  });
  sortedMeasurements.forEach((measurement) => {
    const { osm_node_id, latitude, longitude } = measurement;
    if (osm_node_id && latitude && longitude) {
      lookup[osm_node_id] = { lat: latitude, lon: longitude };
    }
  });
  return lookup;
}

export async function getIntersections(): Promise<IntersectionStats[]> {
  let data: IntersectionMeasurementResult[] = [];
  try {
    data = await getIntersectionMeasurements();
  } catch (e) {
    // TODO: Adding logging
    alert(
      "Unable to fetch intersection measurements. Please try again later or contact Jake."
    );
    console.log(e);
    return [];
  }
  const nodeIdLocationLookup = buildNodeIdLocationLookup(data);
  const safeData = data.filter((measurement) => measurement.osm_node_id);

  try {
    const reportsOrNull: (TrafficLightReport | null)[] = await Promise.all(
      safeData
        .filter(isValidTrafficLightReport)
        .map((measurement) =>
          convertToTrafficLightReport(measurement, nodeIdLocationLookup)
        )
    );
    logOSMCacheStats();

    const reports: TrafficLightReport[] = reportsOrNull.filter(
      (report): report is TrafficLightReport => report !== null
    );

    const intersections: IntersectionStats[] =
      summariseReportsByIntersection(reports);
    return intersections;
  } catch (e) {
    // TODO: Adding logging to DB
    alert(
      "Unable to fetch intersection positions. Please try again later or contact Jake."
    );
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
    return removeVerboseTimezoneDescriptor(localTime);
  }
}

/**
 * Removes `(Australian Eastern Standard Time)` from a timezone string to save space in the table
 * popup.
 */
export function removeVerboseTimezoneDescriptor(input: string): string {
  return input
    .replace(" (Australian Eastern Standard Time)", "")
    .replace(" (Australian Eastern Daylight Time)", "");
}


/**
 * Format a number to one decimal place
 */
export function FormatToOneDecimal (value: number): number {
  return Math.round(value * 10) / 10;
};