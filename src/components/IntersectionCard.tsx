import React from "react";
import { IntersectionStats } from "../types";

export default function IntersectionCard(props: {
  intersection: IntersectionStats;
}) {
  const { intersection } = props;
  const numMeasurements = intersection.reports.length;

  return (
    <div>
      <div
        style={{
          display: "flex",
          margin: "0 0",
        }}
      ></div>
      <p>
        {numMeasurements}{" "}
        {numMeasurements === 1 ? "measurement" : "measurements"} at this
        intersection.

      </p>
      {/* TODO: Replace this with a <Link>, which would need a refactor to use a react-map-gl popup */}
      <a href={`/intersection/node/${intersection.osmId}`}>
        View more stats about this intersection
      </a>
      <table>
        <tbody>
          <tr>
            <th>Time</th>
            {intersection.reports.map((r) => (
              <td key={r.timestamp}>{r.timestamp}</td>
            ))}
          </tr>
          <tr>
            <th>Green</th>
            {intersection.reports.map((r) => (
              <td key={r.timestamp}><span className="green">{r.greenDuration} sec.</span></td>
            ))}
          </tr>
          <tr>
            <th>Flashing red</th>
            {intersection.reports.map((r) => (
              <td key={r.timestamp}><span className="flashing_red">{r.flashingDuration} sec.</span></td>
            ))}
          </tr>
          <tr>
            <th>Red</th>
            {intersection.reports.map((r) => (
              <td key={r.timestamp}><span className="red">{r.redDuration} sec.</span></td>
            ))}
          </tr>
          <tr>
            <th>Total red duration</th>
            {intersection.reports.map((r) => (
              <td key={r.timestamp}>{r.totalRedDuration} sec.</td>
            ))}
          </tr>
          <tr>
            <th>Unprotected when flashing red?</th>
            {intersection.reports.map((r) => (
              <td key={r.timestamp}>{r.unprotectedOnFlashingRed === true ? 'Yes' : (r.unprotectedOnFlashingRed === false ? 'No' : 'Unknown')}</td>
            ))}
          </tr>
          <tr>
            <th>Notes</th>
            {intersection.reports.map((r) => (
              <td key={r.timestamp}>{r.notes ? r.notes : ''}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
