import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
// @ts-ignore
import { HashLink } from "react-router-hash-link";

export const MapInfoBox: FunctionComponent = () => {
  return (
    <>
      <h2>Better Intersections</h2>
      <h3>A pedestrian traffic light timing map</h3>

      <Link to={`/about`}>Read more about this map and data</Link>
      <p>
        You can contribute data with a simple form -{" "}
        <HashLink to={`/about#contributing`}>See the instructions!</HashLink>
      </p>
      {/* 
      // in development :) 
      <p>
        <Link to={`/longest-and-shortest-waits`}>
          See the longest and shortest waits measured!
        </Link>
      </p> */}
      <p>
        A side project by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://jakecoppinger.com"
        >
          Jake Coppinger
        </a>
      </p>
    </>
  );
};
