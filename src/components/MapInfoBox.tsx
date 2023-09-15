import React, { FunctionComponent } from "react";
import { Link } from "react-router-dom";
// @ts-ignore
import { HashLink } from "react-router-hash-link";

/** Pretend feature flag */
const showNewForm = true;

export const MapInfoBox: FunctionComponent = () => {
  return (
    <>
      <h2>Better Intersections</h2>
      <h3>A crowdsourced pedestrian traffic light timing map</h3>
      <p>
        <Link to={`/about`}>Read more</Link> about this project or{" "}
        <HashLink to={`/about#contributing`}>contribute measurments</HashLink>.
      </p>
      {showNewForm && (
        <p>
          <Link to={`/contribute-measurement`}>
            [beta] Contribute a measurement
          </Link>
        </p>
      )}
      <p>
        See the{" "}
        <Link to={`/longest-and-shortest-waits`}>
          longest and shortest waits measured
        </Link>.
      </p>
      <p>
        Started by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://jakecoppinger.com"
        >
          Jake Coppinger
        </a>{" "}
        with contributions by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/Uzaif-Sheikh"
        >
          Uzaif Sheikh
        </a>{" "}
        and{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/17Ayaan28"
        >
          Ayaan Adil
        </a>
        .
      </p>
    </>
  );
};
