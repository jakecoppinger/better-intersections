import { useLoaderData, LoaderFunctionArgs } from "react-router-dom";
import React, { useState, useEffect } from "react";
import { fetchOsmWaysForNode } from "../api/osm";
import { IntersectionStats, Way } from "../types";
import { HeaderAndFooter } from "../components/HeaderAndFooter";
import {
  generateGeohackQueryParam,
  googleStreetViewUrl,
} from "../utils/url-formatting";
import {
  convertUTCtoLocal,
  getIntersections,
} from "../utils/utils";
import { getMainWayForIntersection } from "../utils/intersection-computed-properties";
import { Helmet } from '@dr.pogodin/react-helmet';

export async function nodeIdLoader({ params }: LoaderFunctionArgs) {
  const nodeId = params.nodeId;
  return { nodeId };
}

export default function IntersectionNodePage() {
  const [adjacentWays, setAdjacentWays] = useState<Way[] | undefined>(undefined);
  const [nodeId, setNodeId] = useState<number | undefined>(undefined);
  const [intersection, setIntersection] = useState<
    IntersectionStats | undefined
  >(undefined);

  useEffect(() => {
    async function getAdjacentWays() {
      if (nodeId === undefined) {
        return;
      }
      const ways = await fetchOsmWaysForNode(nodeId);

      setAdjacentWays(ways);
    }
    getAdjacentWays();
  }, [nodeId]);
  const { nodeId: rawNodeId } = useLoaderData() as {
    nodeId: string | undefined;
  };
  useEffect(() => {
    // check if nodeId is a number, but keep it as a string. If it's not a number, set it as undefined
    setNodeId(rawNodeId && !isNaN(parseInt(rawNodeId)) ? parseInt(rawNodeId) : undefined);
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

  const mainWay: Way | undefined | null =
    adjacentWays !== undefined
      ? getMainWayForIntersection(adjacentWays)
      : undefined;

    const pageTitle = `Intersection ${nodeId} - Better Intersections`;
    const pageDescription = intersection
    ? `Crowdsourced traffic signal timings for intersection at ${intersection.lat},
    ${intersection.lon} with OSM ID ${intersection.osmId}`
    : `Crowdsourced traffic signal timings for intersection with OSM ID ${nodeId}`;
  return (
    <HeaderAndFooter>

      <Helmet prioritizeSeoTags>
        <title>{pageTitle}</title>
        <meta property="og:title" content={pageTitle} />
        <meta name="description" content={pageDescription}/>
      </Helmet>
      <div>
        <h1>
          <span>
            {mainWay === undefined
              ? "Loading street "
              : (
                mainWay !== null
                  ? mainWay.tags.name + " "
                  : "Unknown street "
              )
            }
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
              <th>Cycle duration</th>
              <th>Unprotected when flashing red?</th>
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
                  <td>{convertUTCtoLocal(r.timestamp.toString())}</td>
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
                  <td>{r.cycleLength} sec.</td>
                  <td>{r.unprotectedOnFlashingRed === true ? 'Yes' : (r.unprotectedOnFlashingRed === false ? 'No' : 'Unknown')}</td>
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
                GeoHack (links to multiple maps at this location)
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
