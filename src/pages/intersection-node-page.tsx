import { useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { fetchOsmWaysForNode } from "../api/osm";
import { IntersectionStats, Way } from "../types";
import { getIntersections } from "../api/google-sheets";
import HeaderAndFooter from "../components/HeaderAndFooter";
import {
  generateGeohackQueryParam,
  googleStreetViewUrl,
} from "../utils/url-formatting";

export async function nodeIdLoader({ params }: LoaderFunctionArgs) {
  const nodeId = params.nodeId;
  return { nodeId };
}

function getMainWayForIntersection(ways: Way[]): Way {
  // Usually 2 ways left after filtering out footpaths
  const adjacentRoad = ways[0];
  return adjacentRoad;
}

export default function IntersectionNodePage() {
  const [adjacentWays, setAdjacentWays] = useState<Way[] | undefined>(
    undefined
  );
  const [nodeId, setNodeId] = useState<string | undefined>(undefined);
  const [intersection, setIntersection] = useState<
    IntersectionStats | undefined
  >(undefined);

  // Similar to componentDidMount and componentDidUpdate:  useEffect(() => {    // Update the document title using the browser API    document.title = `You clicked ${count} times`;  });
  useEffect(() => {
    async function getAdjacentWays() {
      if (nodeId === undefined) {
        return;
      }
      const ways = (await fetchOsmWaysForNode(nodeId)).filter(
        (way) => way.tags.highway !== "footway"
      );

      setAdjacentWays(ways);
    }
    getAdjacentWays();
  }, [nodeId]);
  const { nodeId: rawNodeId } = useLoaderData() as {
    nodeId: string | undefined;
  };
  useEffect(() => {
    // check if nodeId is a number, but keep it as a string. If it's not a number, set it as undefined
    setNodeId(rawNodeId && !isNaN(parseInt(rawNodeId)) ? rawNodeId : undefined);
  }, [rawNodeId]);

  useEffect(() => {
    async function getIntersectionData() {
      if (nodeId === undefined) {
        return;
      }

      const intersections = await getIntersections();
      const intersection = intersections.find((i) => i.osmId === nodeId);
      setIntersection(intersection);
    }
    getIntersectionData();
  }, [nodeId]);

  if (nodeId === undefined) {
    return (
      <div>
        <h1>Invalid nodeId</h1>
      </div>
    );
  }

  const mainWay: Way | undefined =
    adjacentWays !== undefined
      ? getMainWayForIntersection(adjacentWays)
      : undefined;

  return (
    <HeaderAndFooter>
      <div>
        <h1>
          <span>
            {adjacentWays === undefined
              ? "Loading street "
              : adjacentWays[0].tags.name + " "}
            {intersection ? (
              <span>
                (
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={`https://geohack.toolforge.org/geohack.php?params=${generateGeohackQueryParam(
                    { lat: intersection.lat, lon: intersection.lon }
                  )}`}
                >
                  {intersection.lat}, {intersection.lon}
                </a>
                )
              </span>
            ) : (
              <span>(...)</span>
            )}
          </span>
        </h1>

        {/* TODO: Add paragraph like x measurements over x hours/days whatever */}
        <h2>Pedestrian/cycling traffic light time measurements</h2>
        <table>
          <thead>
            <tr>
              <th>Time</th>
              <th>Green</th>
              <th>Flashing red</th>
              <th>Red</th>
              <th>Cycle</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {intersection === undefined ? (
              <tr>
                <td>Loading...</td>
              </tr>
            ) : (
              intersection.reports.map((r) => (
                <tr key={r.osmId}>
                  <td>{r.timestamp}</td>
                  <td>
                    <span className="green">{r.greenDuration} sec.</span>
                  </td>
                  <td>
                    <span className="flashing_red">
                      {r.flashingDuration} sec.
                    </span>
                  </td>
                  <td>
                    <span className="red">{r.redDuration} sec.</span>
                  </td>
                  <td>{r.cycleTime} sec.</td>
                  {r.notes ? <td>{r.notes}</td> : <td></td>}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <h3>View intersection location on:</h3>
        <ul>
          <li>
            {intersection === undefined ? (
              <p>Loading...</p>
            ) : (
              <a
                target="_blank"
                rel="noopener noreferrer"
                href={`https://geohack.toolforge.org/geohack.php?params=${generateGeohackQueryParam(
                  { lat: intersection.lat, lon: intersection.lon }
                )}`}
              >
                GeoHack
              </a>
            )}
          </li>
          <li>
            <a
              target="_blank"
              rel="noopener noreferrer"
              href={`https://www.openstreetmap.org/node/${nodeId}`}
            >
              OpenStreetMap
            </a>
          </li>
          <li>
            {intersection === undefined ? (
              <p>Loading...</p>
            ) : (
              <span>
                <a
                  target="_blank"
                  rel="noopener noreferrer"
                  href={googleStreetViewUrl(intersection.lat, intersection.lon)}
                >
                  Google StreetView
                </a>{" "}
                (do not use for OSM mapping)
              </span>
            )}
          </li>
        </ul>
        <h3>Quick stats:</h3>
        <table>
          <tbody>
            <tr>
              <td>Number of lanes</td>
              <td>
                {mainWay
                  ? mainWay.tags.lanes || "No lane data in OSM"
                  : "Loading..."}
              </td>
            </tr>
            <tr>
              <td>Oneway road</td>
              <td>
                {mainWay
                  ? mainWay.tags.oneway || "No oneway data in OSM"
                  : "Loading..."}
              </td>
            </tr>
            <tr>
              <td>OSM Road classification</td>
              <td>
                {mainWay
                  ? mainWay.tags.highway || "No highway data in OSM"
                  : "Loading..."}
              </td>
            </tr>
          </tbody>
        </table>

        <h3>
          Raw OpenStreetMap data (ways around{" "}
          <a href={`https://www.openstreetmap.org/node/${nodeId}`}>
            node {nodeId}
          </a>
          )
        </h3>
        {intersection !== undefined ? (
          <div>
            <pre>{JSON.stringify(adjacentWays, null, 2)} </pre>
          </div>
        ) : null}
      </div>
    </HeaderAndFooter>
  );
}
