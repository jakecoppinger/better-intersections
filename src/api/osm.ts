
import { parseStringPromise } from 'xml2js';
import { Way } from '../types';
import { tagListToRecord } from '../utils/utils';

export async function getOsmNodePosition(osmNode: string | number): Promise<{ lat: number, lon: number, tags: Record<string, string> }> {
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

  return { lat, lon, tags };
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

export async function isNodeValid(osmNode: string) {

  const nodeRegex = /^[0-9]+$/;

  if (!nodeRegex.test(osmNode)) {
    return false;
  } 

  const response: Response = await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmNode}`);
  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
}