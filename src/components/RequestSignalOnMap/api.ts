import { RawOSMCrossing } from "../../types";
import { overpassTurboRequest } from "../../api/overpass";

/**
 * Fetch an array of signalised crossing locations from OSM within a given radius of a given location.
 * Queries for crossing=traffic_signals and also highway=crossing, crossing:signals=yes.
 *
 * @param my_location lat and lon of the location to search around
 * @param query_radius radius in meters to search around the location
 * @returns List of raw OSM traffic signal crossing objects. Includes the sites.
 */
export async function getOSMCrossings(
  my_location: { lat: number; lon: number },
  query_radius: number
): Promise<any> {
  const query = `
    [out:json][timeout:25];
    (
        node["crossing"="traffic_signals"](around:${query_radius},${my_location.lat},${my_location.lon});
        node["highway"="crossing"]["crossing:signals"="yes"](around:${query_radius},${my_location.lat},${my_location.lon});
    )->.crossings;

    rel(bn.crossings)["type"="site"]["site"="traffic_signals"]->.sites;

    (.crossings; .sites;);
    out body;
    >;
    out skel qt;
    `;

  const elements = await overpassTurboRequest(query);
  return elements as any;
}
