import { Link } from "react-router-dom";
import { FC, PropsWithChildren } from "react";
import styled from "@emotion/styled";

export const WideWrapper = styled.div`
  max-width:90%;
  margin: 0 auto;
  img {
    max-width:100%;
  }
  p,h1,h2,h3,h4,h5,h6 {
    width: 700px;
    max-width: 90%;
  }
`;
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



export const HeaderAndFooterWide = ({children, pageTitle}: PropsWithChildren<{pageTitle: string}>) => {

  return (
    <WideWrapper>
      <h1><Link to={`/`}>Better Intersections</Link> / {pageTitle}</h1>
      {children}
    </WideWrapper>
  );
};