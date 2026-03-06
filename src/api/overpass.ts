import { OSMNode, OSMRelation, OSMWay } from "../types";




const apiUrl = 'http://jakes-dev-server:54321/api/interpreter';
// const apiUrl = 'https://overpass-api.de/api/interpreter';

export async function overpassTurboRequestWithRetries({
  request,
  retries = 3,
}: { request: string, retries?: number }): Promise<(OSMNode | OSMWay | OSMRelation)[]> {
  for (let i = 0; i < retries; i++) {
    try {
      return await overpassTurboRequest(request);
    } catch (e) {
      console.error(`Error: ${e}`);
    }
  }
  throw new Error(`Failed to fetch data after ${retries} retries`);
}

/**
 * Returns the raw JSON response from the Overpass Turbo API.
 * @returns Response - with `elements` property containing the raw JSON response.
 */
export async function overpassTurboRequest(request: string): Promise<any> {

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
    return jsonResponse;
  } catch (e) {
    console.error(`Request: ${request}`);
    console.error(`Response: ${textResponse}`);
    throw new Error('Failed to parse response as JSON:' + e);
  }
}
