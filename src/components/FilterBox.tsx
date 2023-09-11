import React from "react";
import { RangeSlider } from "rsuite";
import { FilterContainer, FilterHeader, FilterText } from "../styles/filter.style";
import "rsuite/dist/rsuite-no-reset.min.css";


export default function FilterBox(props: {
  maxRange: number;
  value: [number, number];
  setValue: (value: [number, number]) => void;
}) {
  const { maxRange, value, setValue } = props;

  return (
    <>
      <FilterContainer>
        <FilterHeader>Filters</FilterHeader>
        <FilterText>Total Cycle Time(s):</FilterText>
        <RangeSlider
          value={value}
          max={maxRange}
          onChange={setValue}
          renderTooltip={(v) => `${v}s`}
        />
      </FilterContainer>
    </>
  );
}
