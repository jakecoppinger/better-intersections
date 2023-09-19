
export interface RawOSMCrossing {
  type: "node",
  id: number,
  lat: number,
  lon: number,
  // tags: {
  // },
}

export async function getOSMCrossings(my_location: { lat: number; lon: number }, query_radius: number): Promise<RawOSMCrossing[]> {
  const apiUrl = 'https://overpass-api.de/api/interpreter';
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
