import styled from "@emotion/styled";
import { IntersectionStats } from "../types";
import { convertUTCtoLocal } from "../utils/utils";

const IntersectionCardText = styled.p`
  margin-top: 0px;
  margin-bottom:0px;
`;

/** Truncates a string to a given length,
 * adding "..." (if the string is longer than the length), which is linked somewhere.
*/
function TruncateStringToLength({ string, length, longerUrl }: { string: string, length: number, longerUrl: string }): React.ReactNode {
  if (string.length <= length) {
    return string;
  }
  return string.slice(0, length) + "..." + <a href={longerUrl}>(view full)</a>;
}

function OldStatsTable({ intersection, detailedStatsUrl }: { intersection: IntersectionStats, detailedStatsUrl: string }): React.ReactNode {
  return (
    <table>
      <tbody>
        <tr>
          <th>Time</th>
          {intersection.reports.map((r) => (
            <td key={r.timestamp.toString()}>{convertUTCtoLocal(r.timestamp.toString())}</td>
          ))}
          <th>Green</th>
          {intersection.reports.map((r) => (
            <td key={r.timestamp.toString()}><span className="green">{r.greenDuration} sec.</span></td>
          ))}
        </tr>
        <tr>
          <th>Flashing red</th>
          {intersection.reports.map((r) => (
            <td key={r.timestamp.toString()}><span className="flashing_red">{r.flashingDuration} sec.</span></td>
          ))}
        </tr>
        <tr>
          <th>Red</th>
          {intersection.reports.map((r) => (
            <td key={r.timestamp.toString()}><span className="red">{r.redDuration} sec.</span></td>
          ))}
        </tr>
        <tr>
          <th>Cycle length</th>
          {intersection.reports.map((r) => (
            <td key={r.timestamp.toString()}>{Math.round(r.cycleLength * 100) / 100} sec.</td>
          ))}
        </tr>
        <tr>
          <th>Red+flashing</th>
          {intersection.reports.map((r) => (
            <td key={r.timestamp.toString()}>{r.redDuration + r.flashingDuration} sec.</td>
          ))}
        </tr>
        <tr>
          <th>Cycle time</th>
          {intersection.reports.map((r) => (
            <td key={r.timestamp.toString()}>{
              Math.round((r.greenDuration + r.redDuration + r.flashingDuration) * 100) / 100} sec.</td>
          ))}
        </tr>
        <tr>
          <th>Unprotected when flashing red</th>
          {intersection.reports.map((r) => (
            <td key={r.timestamp.toString()}>{r.unprotectedOnFlashingRed === true ? 'Yes' : (r.unprotectedOnFlashingRed === false ? 'No' : 'Unknown')}</td>
          ))}
        </tr>
        <tr>
          <th>Notes</th>
          {intersection.reports.map((r) => (
            <td key={r.timestamp.toString()}><TruncateStringToLength
              string={r.notes ? r.notes : ''}
              length={100} longerUrl={detailedStatsUrl} /></td>
          ))}
        </tr>
      </tbody>
    </table>
  );
}


export function IntersectionCard(props: {
  intersection: IntersectionStats;
}) {
  const { intersection } = props;
  const detailedStatsUrl = `/intersection/node/${intersection.osmId}`;

  const numMeasurements = intersection.reports.length;

  // WIP
  // const averageGreenDuration = intersection.reports.reduce((acc, r) => acc + r.greenDuration, 0) / numMeasurements;
  // const averageCycleTime = intersection.reports.reduce((acc, r) => acc + r.cycleLength, 0) / numMeasurements;
  // const maximumCycleTime = Math.max(...intersection.reports.map((r) => r.cycleLength));
  // const maximumMaxWaitTime = Math.max(...intersection.reports.map((r) => r.redDuration + r.flashingDuration));


  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          display: "flex",
          margin: "0 0",
        }}
      ></div>
      <IntersectionCardText>
        Are you here? <a href={`/contribute-measurement/${intersection.osmId}`}>
          Submit measurement</a>.<br></br>
        {numMeasurements}{" "}
        {numMeasurements === 1 ? "measurement" : "measurements"} here - {" "}
        {/* TODO: Replace this with a <Link>, which would need a refactor to use a react-map-gl popup */}
        <a href={detailedStatsUrl}>
          View Detailed Stats
        </a>.
      </IntersectionCardText>
      <OldStatsTable intersection={intersection} detailedStatsUrl={detailedStatsUrl} />
    </div>
  );
}
