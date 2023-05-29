import React from "react";
import { IntersectionStats } from "./types";

interface Props {
  intersection: IntersectionStats;
}

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
      <p style={{ marginLeft: 4 }}>
        <p>
          {numMeasurements}{" "}
          {numMeasurements === 1 ? "measurement" : "measurements"} at this
          intersection.
        </p>
        <table>
          <tr>
            <th>Time</th>
            <th>Green</th>
            <th>Flashing red</th>
            <th>Red</th>
            <th>Cycle</th>
            <th>Notes</th>
          </tr>
          {intersection.reports.map((r) => (
            <tr key={r.osmId}>
              <td>{r.timestamp}</td>
              <td>
                <span className="green">{r.greenDuration}</span>
              </td>
              <td>
                <span className="flashing_red">{r.flashingDuration}</span>
              </td>
              <td>
                <span className="red">{r.redDuration}</span>
              </td>
              <td>{r.cycleTime}</td>
              {r.notes ? <td>{r.notes}</td> : <td></td>}
            </tr>
          ))}
        </table>
        {/* <h3>Measured at {timestamp}</h3>
        <br></br>
        <b>Green duration:</b> {greenDuration} seconds
        <br></br>
        <b>Flashing red duration:</b> {flashingDuration} seconds
        <br></br>
        <b>Solid red duration:</b> {redDuration} seconds
        <br></br>
        <b>Cycle time:</b> {cycleTime} seconds
        <br></br>
        {notes ? `Additional notes: ${notes}` : ""} */}
        <br></br>
        {/* Additional OpenStreetMap intersection info:
        <pre>{JSON.stringify(tags, null, 2)}</pre> */}
      </p>
    </div>
  );
}
