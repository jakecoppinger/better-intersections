import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";

export const MapInfoBox: FunctionComponent = () => {
  return (
    <>
      <h2>Better Intersections</h2>
      <h3>A pedestrian traffic light timing map</h3>

      <Link to={`/about`}>Read more about this map and data</Link>
      <p>
        You can contribute data with a simple form -{" "}
        <Link to={`/about`}>See the instructions!</Link>
      </p>
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
