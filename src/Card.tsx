import React from "react";
import { TrafficLightReport } from "./types";

interface Props {
  item: TrafficLightReport;
}

export default function Card(props: Props) {
  const { item } = props;
  const {
    greenDuration,
    flashingDuration,
    redDuration,
    cycleTime,
    notes,
    timestamp,
    tags,
  } = item;

  return (
    <div>
      <div
        style={{
          display: "flex",
          margin: "8px 0",
        }}
      ></div>
      <p style={{ marginLeft: 4 }}>
        <h3>Measured at {timestamp}</h3>
        <br></br>
        <b>Green duration:</b> {greenDuration} seconds
        <br></br>
        <b>Flashing red duration:</b>  {flashingDuration} seconds
        <br></br>
        <b>Solid red duration:</b>  {redDuration} seconds
        <br></br>
        <b>Cycle time:</b>  {cycleTime} seconds
        <br></br>
        {notes ? `Additional notes: ${notes}` : ""}
        
        <br></br>
        Additional OpenStreetMap intersection info:
        <pre>{JSON.stringify(tags, null, 2)}</pre>
      </p>
    </div>
  );
}
