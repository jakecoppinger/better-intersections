
import { parseStringPromise } from 'xml2js';
import { OSMNode, Way } from '../types';
import { tagListToRecord } from '../utils/utils';
import osmCache from './osm-cache.json'

let cacheHits = 0;
let cacheMisses = 0;

/**
 * Log debug output of the OSM cache hit rate. Run this after fetching all nodes.
 */
export function logOSMCacheStats() {
  const totalHits = cacheHits + cacheMisses;
  console.log(`OSM API cache stats: Loaded ${totalHits} nodes. ${cacheMisses} misses. ${cacheHits / (cacheHits + cacheMisses) * 100}% hit rate.`);
}
/*
Function that checks if the node is in the cache, if not, it fetches it
from the OSM API (using getOsmNodePosition)
*/
export async function getOsmNodePosition(osmNode: string | number): Promise<OSMNode> {
  const possibleCacheHit = (osmCache as Record<string, OSMNode | undefined>)[osmNode.toString()];

  if (possibleCacheHit) {
    cacheHits += 1;
    return possibleCacheHit;
  } else {
    cacheMisses += 1;
    return await requestOsmNodePosition(osmNode);
  }
}


/**
 * Attempt to fetch the position of an OSM node from the OSM API.
 * Throws an error if the node does not exist or for any other HTTP error.
 * @param osmNode String or number of the OSM Node.
 * @returns Object containing the latitude, longitude and tags of the node.
 */
export async function requestOsmNodePosition(osmNode: string | number): Promise<OSMNode> {
  const response = await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmNode}`)
  if (response.status !== 200) {
    if (response.status === 410) {
      throw new Error(`HTTP 410: OSM node ${osmNode} has been deleted`);
    }
    throw new Error(`HTTP ${response.status}: OSM node ${osmNode} could not be fetched`);
  }

  const responseString: string = await response.text();
  const osmApiResult = await parseStringPromise(responseString);

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

  const nodeRegex = /^[0-9]{1,10}$/;

  if (!nodeRegex.test(osmNode)) {
    return false;
  }

  let osmNodeNumber = parseInt(osmNode);
  if (osmNodeNumber < 0 || osmNodeNumber >= 9500000000) {
    return false;
  }

  const response: Response = await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmNode}`);
  if (response.status === 200) {
    return true;
  } else {
    return false;
  }
}