import { OSMNode, OSMRelation, OSMWay, RawOSMCrossing } from "../types";



const apiUrl = 'https://overpass-api.de/api/interpreter';
export async function getOSMCrossings(my_location: { lat: number; lon: number }, query_radius: number): Promise<RawOSMCrossing[]> {
  console.log("Started POST request...");

  const request_str = `
    [out:json][timeout:25];
    (
        node["crossing"="traffic_signals"](around:${query_radius},${my_location.lat},${my_location.lon});
    );
    out body;
    >;
    out skel qt;
    `;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: request_str,
  });

  if (!response.ok) {
    throw new Error(`Fetch error: ${response.statusText}`);
  }

  const jsonResponse = await response.json();
  return jsonResponse.elements as RawOSMCrossing[];
}


export async function overpassTurboRequest(request: string): Promise<(OSMNode | OSMWay | OSMRelation)[]> {
  console.log(`Started POST request at ${new Date().toISOString()}`);

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: request,
  });

  if (!response.ok) {
    console.error(`Request: ${request}`);
    throw new Error(`Fetch error: ${response.statusText}`);
  }

  const textResponse = await response.text();
  try {
    const jsonResponse = JSON.parse(textResponse);
    return jsonResponse.elements as (OSMNode | OSMWay)[];
  } catch (e) {
    console.error(`Request: ${request}`);
    console.error(`Response: ${textResponse}`);
    throw new Error('Failed to parse response as JSON:' + e);
  }
}
