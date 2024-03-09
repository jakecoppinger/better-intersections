
import { parseStringPromise } from 'xml2js';
import { OSMNode, Way } from '../types';
import { tagListToRecord } from '../utils/utils';
import osmCache from './osm-cache.json'

let totalLookups = 0;
let jsonCacheHits = 0;
let dbCacheHits = 0;

let jsonCacheMisses = 0;
let dbCacheMisses = 0;

/**
 * Log debug output of the OSM cache hit rate. Run this after fetching all nodes.
 */
export function logOSMCacheStats() {
  console.log(`OSM API cache stats: Loaded ${totalLookups} nodes. ${dbCacheMisses} DB cache misses, ${jsonCacheMisses} json cache misses. ${dbCacheHits / (dbCacheHits + dbCacheMisses) * 100}% DB cache hit rate, ${jsonCacheHits / (jsonCacheHits + jsonCacheMisses) * 100}% JSON cache hit rate.`);
}
/*
Function that checks if the node is in the JSON cache or already stored in our DB, if not, it
fetches it from the OSM API (using getOsmNodePosition).
*/
export async function getOsmNodePosition(osmNode: number,
  nodeIdLocationLookup: Record<number, { lat: number, lon: number }>): Promise<{ lat: number, lon: number }> {
  totalLookups += 1;
  const possibleJsonCacheHit = (osmCache as Record<string, OSMNode | undefined>)[osmNode];
  const possibleDBCacheHit = nodeIdLocationLookup[osmNode];
  if (possibleDBCacheHit) {
    dbCacheHits += 1;
    return possibleDBCacheHit;
  }
  dbCacheMisses += 1;

  if (possibleJsonCacheHit) {
    jsonCacheHits += 1;
    return possibleJsonCacheHit;
  }
  jsonCacheMisses += 1;

  return await requestOsmNodePosition(osmNode);
}


/**
 * Makes a request to the OSM API to fetch the raw node data.
 * If the node has been deleted, it will fetch the last version of the node from the history API.
 * @param osmNode OSM Node ID
 * @returns Raw JSON for the node from the OSM API
 */
async function requestRawOsmNode(osmNode: number): Promise<any> {
  const response = await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmNode}`)
  if (response.status !== 200) {
    if (response.status === 410) {
      console.log(`Warning: OSM node ${osmNode} has been deleted. Fetching via history instead.`);
      const historyResponse = await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmNode}/history`)
      if (historyResponse.status !== 200) {
        throw new Error(`HTTP ${historyResponse.status}: History for OSM node ${osmNode} could not be fetched`);
      }
      const historyResponseString: string = await historyResponse.text();
      const parsedResult = await parseStringPromise(historyResponseString);
      const numVersions = parsedResult.osm.node.length;
      if (numVersions === 0) {
        throw new Error(`No node array found in history API response for OSM node ${osmNode}`);
      }
      if(numVersions === 1) {
        throw new Error(`Node ${osmNode} has only one version, but it is deleted, which should be impossible.`);
      }
      // We want the second-to-last version, which is the last undeleted version.
      return parsedResult.osm.node[numVersions - 2];
    }
    throw new Error(`HTTP ${response.status}: OSM node ${osmNode} could not be fetched`);
  }

  const responseString: string = await response.text();
  const osmApiResult = await parseStringPromise(responseString);
  if (!osmApiResult.osm.node || osmApiResult.osm.node.length === 0) {
    throw new Error(`No node array found in API response for OSM node ${osmNode}`);
  }
  return osmApiResult.osm.node[0];
}

/**
 * Fetch the position of an OSM node from the OSM API.
 * If the node does not exist or any error occurs, returns {lat: null, lon: null}.
 */
export async function attemptFindNodeLocation(osmNode: number | undefined | null): Promise<{lat: number | null, lon: number | null}> {
  if(osmNode === undefined || osmNode === null) {
    return {lat: null, lon: null};
  }
  try {
  const node = await requestOsmNodePosition(osmNode);
  return {lat: node.lat, lon: node.lon};
  } catch (e) {
    console.warn(`Failed to fetch lat/lon for OSM node ${osmNode} during submission, leaving it out. Error: ${e}`);
    return {lat: null, lon: null};
  }
}

/**
 * Attempt to fetch the position of an OSM node from the OSM API.
 * Throws an error if the node does not exist or for any other HTTP error.
 * @param osmNode String or number of the OSM Node.
 * @returns Object containing the latitude, longitude and tags of the node.
 */
export async function requestOsmNodePosition(osmNode: string | number): Promise<OSMNode> {
  const rawNode = await requestRawOsmNode(parseInt(osmNode.toString()));
  const latString: string | undefined = rawNode.$.lat;
  const lonString: string | undefined = rawNode.$.lon;

  if( latString === undefined || lonString === undefined) {
    throw new Error(`Undefined latitude or longitude for OSM node ${osmNode}`);
  }
  const lat = parseFloat(latString);
  const lon = parseFloat(lonString);


  if (lat > 90 || lat < -90) {
    throw new Error(`Invalid latitude: ${lat}`);
  }

  // Extract tags
  const tags: Record<string, string> = {};
  const tagArray = rawNode.tag || [];
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