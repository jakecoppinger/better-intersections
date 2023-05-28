import { FormResponse, TrafficLightReport } from "./types";
import { parseStringPromise } from 'xml2js';


export async function convertToTrafficLightReport(formResponse: FormResponse): Promise<TrafficLightReport> {
  let osmId = formResponse["Optional: What is the OpenStreetMap node ID of the intersection? (exact crossing node preferable)"];
  const response: string= await (await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmId}`)).text();

  const osmApiResult = await parseStringPromise(response);
  const lat = parseFloat(osmApiResult.osm.node[0].$.lat);
  const lon = parseFloat(osmApiResult.osm.node[0].$.lon);

  if(lat > 90 || lat< -90) {
    throw new Error(`Invalid latitude: ${lat}`);
  }
  const timestampOverride: string = formResponse["Optional: What time (to the nearest 15 min) did you measure this?\nIf not specified assumes current time."]

  const val =  {
    osmId: osmId,
    lat: lat,
    lon: lon,
    greenDuration: parseInt(formResponse["How many seconds was the pedestrian light green for?"]),
    flashingDuration: parseInt(formResponse["How many seconds was the pedestrian light flashing red for?"]),
    redDuration: parseInt(formResponse["How many seconds was the pedestrian light solid red for?"]),
    notes: formResponse["Optional: Any other notes or observations?\n(possible improvements)"],
    timestamp: timestampOverride && timestampOverride.length > 0 ? timestampOverride : formResponse["Timestamp"]
  }
  const cycleTime = val.greenDuration + val.flashingDuration + val.redDuration;

  return {...val, cycleTime};
}