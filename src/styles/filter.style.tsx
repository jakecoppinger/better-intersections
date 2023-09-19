import styled from "@emotion/styled";
export const FilterContainer = styled.div`
  position: absolute;
  right: 10px;
  top: 0.63rem;
  background-color: rgba(255, 255, 255, 0.62);
  border-radius: 0.6rem;
  margin-right: 0.8rem;
  padding: 10px 12px;
  z-index: 100;
  width: calc(100vw - 60px);
  max-width: 400px;
  border: 2px solid white;

  /* Max width in media query "empirically derived" when filter box
  collides with info box */
  @media (max-width: 950px) {
    right: initial;
    top: initial;
    bottom: 30px;
    left: 10px;
  }
`;


export const FilterText = styled.p`
  margin-top: 5px;
  margin-bottom: 8px;
`;
