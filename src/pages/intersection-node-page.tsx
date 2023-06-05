import { useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import React from "react";
import { parseStringPromise } from 'xml2js';

export async function nodeIdLoader({ params }: LoaderFunctionArgs) {
  const nodeId = params.nodeId;
  return { nodeId };
}

interface RawWayObject {
  $: {
    changeset: string;
  }
}

async function getOsmNodePosition(osmNode: string) {
  const response: string = await (await fetch(`https://api.openstreetmap.org/api/0.6/node/${osmNode}/ways`)).text();
  const osmApiResult = await parseStringPromise(response);
  const ways = osmApiResult.osm.way
  console.log(JSON.stringify(ways, null,2));

  // const lat = parseFloat(osmApiResult.osm.node[0].$.lat);
  // const lon = parseFloat(osmApiResult.osm.node[0].$.lon);

  // if (lat > 90 || lat < -90) {
  //   throw new Error(`Invalid latitude: ${lat}`);
  // }

  // // Extract tags
  // const tags: Record<string, string> = {};
  // const tagArray = osmApiResult.osm.node[0].tag || [];
  // tagArray.forEach((tag: any) => {
  //   tags[tag.$.k] = tag.$.v;
  // });

  // return { lat, lon, tags };
}

export default function IntersectionNodePage() {
  const { nodeId: rawNodeId } = useLoaderData() as { nodeId: string | undefined };
  // check if nodeId is a number, but keep it as a string. If it's not a number, set it as undefined
  const nodeId = rawNodeId && !isNaN(parseInt(rawNodeId)) ? rawNodeId : undefined;
  if(nodeId === undefined) {
  return (
    <div>
      <h1>Invalid nodeId</h1>
    </div>
  );

  }
  getOsmNodePosition(nodeId);
  return (
    <div>
      <h1>Intersection {nodeId} </h1>
    </div>
  );
}
