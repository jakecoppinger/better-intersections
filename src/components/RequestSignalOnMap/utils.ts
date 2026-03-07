import { OSMWay, OSMNode, RawOSMCrossing } from "@/src/types";

export interface SiteDetails {
  /* eg. "TfNSW Traffic Controlled Site 0414", */
  "name": string;
  /* eg. "Transport for NSW", */
  "operator": string;
  /* eg. 414. Note, a number not a string*/
  "ref": number;
}

/** Takes an OSM signal node id (perhaps selected by a user), and if a parent (containing)
 * traffic signal site relation exists, returns the site details.
 * Otherwise, returns undefined.
 * If the site ref can't be conterted to a number, function returns undefined.
 */
export function getSiteDetailsForNodeId({ trafficSignalOsmNodeId, overpassResponse }: {
  trafficSignalOsmNodeId: number, overpassResponse: any
}): Promise<SiteDetails | undefined> {
  const relation = overpassResponse.elements.find((el: any) =>
    el.type === "relation" &&
    el.tags?.site === "traffic_signals" &&
    el.members?.some((m: any) => m.type === "node" && m.ref === trafficSignalOsmNodeId)
  );

  if (!relation) return Promise.resolve(undefined);

  const ref = parseInt(relation.tags.ref, 10);
  if (isNaN(ref)) return Promise.resolve(undefined);

  return Promise.resolve({
    name: relation.tags.name,
    operator: relation.tags.operator,
    ref,
  });
}

