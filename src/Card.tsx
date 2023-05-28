import React from "react";
import { TrafficLightReport } from "./types";

interface Props {
  item: TrafficLightReport;
}

export default function Card(props: Props) {
  const { item } = props;
  const { greenDuration, flashingDuration, redDuration, cycleTime, notes, timestamp  } =
    item;

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
        Green duration: {greenDuration} seconds
        <br></br>
        Flashing red duration: {flashingDuration} seconds
        <br></br>
        Solid red duration: {redDuration} seconds
        <br></br>
        Cycle time: {cycleTime} seconds
        <br></br>
        {notes ? `Additional notes: ${notes}` : ""}
      </p>
    </div>
  );
}
