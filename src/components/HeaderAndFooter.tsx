import { Link } from "react-router-dom";
import React from "react";
import styled from 'styled-components';
export const Wrapper = styled.div`
  max-width:90%;
  width:700px;
  margin: 0 auto;
`;

const HeaderAndFooter: React.FC = ({children}) => {
  return (
    <Wrapper>
      <h1><Link to={`/`}>Better Intersections</Link></h1>
      {children}
    </Wrapper>
  );
};

export default HeaderAndFooter;
