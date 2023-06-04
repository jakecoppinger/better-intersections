import React from "react";
import HeaderAndFooter from "../components/HeaderAndFooter";

const About: React.FC = () => {
  return (
    <HeaderAndFooter>
      <div>
        <h1>About</h1>
        <p>Work in progress!</p>
        <p>
          Better Intersections is a tool to record and visualise timing details
          for pedestrain and bicycle signals. This website is open source on{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://github.com/jakecoppinger/better-intersections"
          >
            Github
          </a>{" "}
          (contributions welcome!), and the data is open data (under the{" "}
          <a href="https://opendatacommons.org/licenses/odbl/">ODbL</a>{" "}
          license).
        </p>
        <p>
          View the data on{" "}
          <a
            target="_blank"
            rel="noopener noreferrer"
            href="https://docs.google.com/spreadsheets/d/1L08GNolPYjiRwLOL2d3lAZPqwCNe5vGr6SAOtH7hnNM/edit?usp=sharing"
          >
            Google Sheets
          </a>
          .
        </p>

        <h1>How to contribute</h1>

        <p>
          What you will need:
          <ol>
            <li>A stopwatch</li>
            <li>
              A smartphone, or pencil and paper to record timings and the
              location
            </li>
          </ol>
          Steps to measure an intersection:
          <ol>
            <li>
              If you have a smartphone, open the Google Form:{" "}
              <a
                target="_blank"
                rel="noopener noreferrer"
                href="https://forms.gle/3FFGD5Jk14wUS22n6"
              >
                forms.gle/3FFGD5Jk14wUS22n6
              </a>
            </li>
            <li>
              Write down or note in the form the location of the intersection,
              and exactly which crossing if multiple
              <ol>
                <li>eg. George st and Cleveland st, east side</li>
              </ol>
            </li>
            <li>
              Start the stopwatch when the pedestrian/bicycle lantern turns
              green
            </li>
            <li>
              Press lap when the light starts flashing red (or if it has a
              countdown, when that starts - or if a bicycle lantern, turns
              orange)
            </li>
            <li>Press lap when the light turns solid red</li>
            <li>Press the crossing button to request the lights to change</li>
            <li>Press lap when the light turns green again</li>
            <li>Record the duratations into the Google Form</li>
          </ol>
        </p>
      </div>
    </HeaderAndFooter>
  );
};

export default About;
