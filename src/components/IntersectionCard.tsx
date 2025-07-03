import styled from "@emotion/styled";
import { IntersectionStats } from "../types";
import { convertUTCtoLocal } from "../utils/utils";

const IntersectionCardText = styled.p`
  margin-top: 10px;
  margin-bottom:0px;
`;

const NoMarginP = styled.p`
  margin-top: 0px;
  margin-bottom: 0px;
`;
export function IntersectionCard(props: {
  intersection: IntersectionStats;
}) {
  const { intersection } = props;
  const numMeasurements = intersection.reports.length;

  return (
    <div style={{ overflowX: "auto" }}>
      <div
        style={{
          display: "flex",
          margin: "0 0",
        }}
      ></div>
      <IntersectionCardText>
        Are you standing here? <a href={`/contribute-measurement/${intersection.osmId}`}>
          Record and submit a measurement!</a>.{" "}
        {numMeasurements}{" "}
        {numMeasurements === 1 ? "measurement" : "measurements"} at this
        intersection.
      </IntersectionCardText>



      <NoMarginP>
        {/* TODO: Replace this with a <Link>, which would need a refactor to use a react-map-gl popup */}
        <a href={`/intersection/node/${intersection.osmId}`}>
          View more detailed stats (including imagery, # of lanes & road type)
        </a>.
      </NoMarginP>
      <table>
        <tbody>
          <tr>
            <th>Time</th>
            {intersection.reports.map((r) => (
              <td key={r.timestamp.toString()}>{convertUTCtoLocal(r.timestamp.toString())}</td>
            ))}
          </tr>
          <tr>
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
              <td key={r.timestamp.toString()}>{r.notes ? r.notes : ''}</td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
