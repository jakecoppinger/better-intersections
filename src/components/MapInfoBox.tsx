import styled from "@emotion/styled";
import { FunctionComponent, useState } from "react";
import { Link } from "react-router-dom/dist/index";


const TitleBox = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: baseline;
`;

const Wrapper = styled.div`
  width: 350px;

  position: absolute;
  top: 10px;
  left: 10px;

  /* Don't attach to right side, but leave a gap */
  margin-right: 10px;
  /* Show above the map, but below the pin popup */
  z-index: 1;

  padding: 5px 10px;

  background-color: rgba(255, 255, 255, 0.8);
  border: 1px solid gray;
  border-radius: 10px;
`;
const DescriptionBox = styled.div`
  overflow: hidden;
  transition: max-height 0.4s ease-in-out;

  &.closed {
    height: 0px;
    max-height: 0px;
  }
  &.open {
    height: auto;
    max-height: 500px;
  }
`;

export const MapInfoBox: FunctionComponent = () => {
  const [open, setOpen] = useState(false);
  return (
    <Wrapper>
      <TitleBox
        onClick={() => {
          console.log("in onclick for title");
          setOpen(!open);
        }}
      >
        <h2 style={{ margin: "0px" }}>Better Intersections</h2>
        <a href="#" style={{}}>
          {!open ? "Read more" : "Close"}
        </a>
      </TitleBox>
      <DescriptionBox className={open ? "open" : "closed"}>
        <h3>A crowdsourced pedestrian traffic light timing map</h3>
        <ul>
          <li>
            <Link to={`/contribute-measurement`}>Contribute a measurement!</Link>
          </li>
          <li>
            <Link to={`/about`}>About</Link> this project
          </li>
          <li>
            <Link to={`/analysis`}>
              Analysis of data patterns
            </Link>
          </li>
          <li>Further reading on{" "}
            <Link
              target="_blank"
              rel="noopener noreferrer"
              to={`https://jakecoppinger.com/2023/07/shining-a-light-on-the-traffic-signals-of-sydney/`}>the design & politics</Link> of Sydney's traffic signals (Jake Coppinger's blog)
          </li>
        </ul>
        <p>The{" "}
          <Link
            target="_blank"
            rel="noopener noreferrer"
            to={`https://www.cityofsydney.nsw.gov.au/policy-planning-changes/your-feedback-walking-strategy-action-plan`}>
            City of Sydney Walking Strategy and Action Plan</Link> is advocating <Link
              target="_blank"
              rel="noopener noreferrer"
              to={`https://www.transport.nsw.gov.au`}>TfNSW</Link> sets a maximum wait time
          at intersections of <b>45 seconds</b> for people walking with a <b>target of 30 seconds</b>.</p>
        <p>
          Built by{" "}
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
      </DescriptionBox>
    </Wrapper>
  );
};
