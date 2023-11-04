import { FC } from "react";
import styled from "@emotion/styled";

const LoadingWrapper = styled.div`
  z-index: 100;
  background-color: white;

  position: absolute;
  bottom: 150px;
  left: 10px;

  border-radius: 10px;
  padding: 5px 10px;
`;

export const LoadingIndicator: FC = () => (
  <LoadingWrapper>
    <em>Loading data...</em>
  </LoadingWrapper>
);
