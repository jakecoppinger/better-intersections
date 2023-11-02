import { Link } from "react-router-dom/dist/index";
import { FC, PropsWithChildren } from "react";
import styled from "@emotion/styled";

export const Wrapper = styled.div`
  max-width:90%;
  width:700px;
  margin: 0 auto;
  img {
  max-width:100%;

  }
`;

export const HeaderAndFooter: FC<PropsWithChildren> = ({children}) => {
  return (
    <Wrapper>
      <h1><Link to={`/`}>Better Intersections</Link></h1>
      {children}
    </Wrapper>
  );
};


