
import { parseStringPromise } from 'xml2js';
import { Way } from '../types';
import { tagListToRecord } from '../utils/utils';


export async function getOsmNodePosition(osmNode: number): Promise<{ lat: number, lon: number, osmNodeID: number, tags: Record<string, string> }> {
  try {
  const response: string = await (await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmNode}`)).text();
  const osmApiResult = await parseStringPromise(response);

  const lat = parseFloat(osmApiResult.osm.node[0].$.lat);
  const lon = parseFloat(osmApiResult.osm.node[0].$.lon);

  if (lat > 90 || lat < -90) {
    throw new Error(`Invalid latitude: ${lat}`);
  }

  // Extract tags
  const tags: Record<string, string> = {};
  const tagArray = osmApiResult.osm.node[0].tag || [];
  tagArray.forEach((tag: any) => {
    tags[tag.$.k] = tag.$.v;
  });

  return { lat, lon, tags, osmNodeID: osmNode };
}catch(e) {
  console.log(`Error fetching OSM node ${osmNode}: ${e}`);
  throw e;

}
}

export async function fetchOsmWaysForNode(nodeId: string | number): Promise<Way[]> {
  const response: string = await (
    await fetch(`https://api.openstreetmap.org/api/0.6/node/${nodeId}/ways`)
  ).text();
  const osmApiResult = await parseStringPromise(response);
  const ways: Way[] = osmApiResult.osm.way
    .map((way: any) => ({
      id: way.$.id,
      timestamp: way.$.timestamp,
      tags: tagListToRecord(way.tag || []),
    }))
    .filter((way: Way) => Object.keys(way.tags).length !== 0);
  return ways;
}