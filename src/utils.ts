import { FormResponse, TrafficLightReport } from "./types";
import { parseStringPromise } from 'xml2js';

function isStringInteger(str: string): boolean {
  const num = Number(str);
  return !isNaN(num) && parseInt(str, 10) === num;
}

/** Returns the lat/lon of an OpenStreetMap node by making a request to the OSM API */
async function getOsmNodePosition(osmNode: string): Promise<{ lat: number, lon: number }> {
  const response: string = await (await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmNode}`)).text();
  const osmApiResult = await parseStringPromise(response);
  const lat = parseFloat(osmApiResult.osm.node[0].$.lat);
  const lon = parseFloat(osmApiResult.osm.node[0].$.lon);

  if (lat > 90 || lat < -90) {
    throw new Error(`Invalid latitude: ${lat}`);
  }
  return { lat, lon };
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
  const { lat, lon } = await getOsmNodePosition(osmId)
  const val = {
    osmId,
    lat: lat,
    lon: lon,
    greenDuration: parseInt(formResponse["How many seconds was the pedestrian light green for?"]),
    flashingDuration: parseInt(formResponse["How many seconds was the pedestrian light flashing red for?"]),
    redDuration: parseInt(formResponse["How many seconds was the pedestrian light solid red for?"]),
    notes: formResponse["Optional: Any other notes or observations?\n(possible improvements)"],
    timestamp: timestampOverride && timestampOverride.length > 0 ? timestampOverride : formResponse["Timestamp"]
  }
  const cycleTime = val.greenDuration + val.flashingDuration + val.redDuration;

  return { ...val, cycleTime };
}