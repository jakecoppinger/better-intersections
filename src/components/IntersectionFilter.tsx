import { RangeSlider } from "rsuite";
import "rsuite/dist/rsuite-no-reset.min.css";
import { DisplayMode, IntersectionFilterState } from "../types";
import styled from "@emotion/styled";
import { Link } from "react-router-dom";

const GreenText = styled.span`
    color: green;
  `;
const RedText = styled.span`
    color: red;
  `;
const OrangeText = styled.span`
    color: orange;
  `;

/**
 * Stops the text below average cycle time filter slider escaping the white container
 */
const RangeSliderContainer = styled.div`
  margin-left: 5px;
  margin-right: 10px;
  `;
export const FilterContainer = styled.div`
  position: absolute;
  right: 10px;
  top: 0.63rem;
  background-color:white;
  border-radius: 0.6rem;
  margin-right: 0.8rem;
  padding: 10px 12px;
  z-index: 1;
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

const ViewModeTitle = styled.p`
    margin-top: 0px;
    margin-bottom: 1px;
    `;
const ViewModeLabel = styled.label`
    margin-left: 2px;
    margin-right: 10px;
  `;

export const FilterText = styled.p`
  margin-top: 8px;
  margin-bottom: 0px;
`;
/**
 * React component for a cycle time filter.
 * The filter is a slider that allows the user to select a range of cycle times to display on the map.
 *
 * Can use in future to filter points by other attributes.
 */
export function IntersectionFilter({ filterRange, min,
  max, updateFilter, updateDisplaymode, displayMode }: {
    /**
     * Should specify the minimum and maximum cycle times of the slider.
     * Min and max values should end in 5 (offset). Cycle time averages tend to be centred around
     * multiple of 10 seconds, so 5 second offsets are less likely to bisect collections of averages
     */
    filterRange: { min: number; max: number };
    /** The minimum cycle time of the slider (seconds) */
    min: number;
    /** The maximum cycle time of the slider (seconds) */
    max: number;
    /** Callback to update the min and max cycle time of points displayed */
    updateFilter: (newState: IntersectionFilterState) => void;
    displayMode: DisplayMode;
    updateDisplaymode: (newDisplayMode: DisplayMode) => void;
  }) {
  const handleDisplayModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayMode = event.target.id as DisplayMode;
    console.log({ newDisplayMode });
    updateDisplaymode(newDisplayMode);
  };

  return (
    <FilterContainer>
      <ViewModeTitle>Colour pins by:</ViewModeTitle>
      <input
        type="radio"
        id="avg_cycle_time"
        name="display-mode"
        value="Avg cycle time"
        checked={displayMode === "avg_cycle_time"}
        onChange={handleDisplayModeChange}
      />
      <ViewModeLabel htmlFor="avg_cycle_time">Avg. cycle time</ViewModeLabel>
      <input
        type="radio"
        id="max_ped_wait_time"
        name="display-mode"
        value="Max wait time"
        checked={displayMode === "max_ped_wait_time"}
        onChange={handleDisplayModeChange}
      />
      <ViewModeLabel htmlFor="max_ped_wait_time">Max pedestrian wait</ViewModeLabel>

      {displayMode === "max_ped_wait_time" ? <p><GreenText>Green represents measurement avg. at crossing of 35s or less (<Link
          target="_blank"
          rel="noopener noreferrer"
          to={`https://www.cityofsydney.nsw.gov.au/strategies-action-plans/city-walking-strategy-action-plan-continuing-vision`}>
          CoS target is ≤ 30</Link>)</GreenText>, <OrangeText>orange 50 or less (recommended max is ≤ 45)</OrangeText> and{" "}
        <RedText>red above 50 seconds</RedText>. Each measurement is max pedestrian wait at that
        time (ie. end of flashing red to start of green) if button has been pressed (or is automatic).</p> : null}

      <FilterText>Filter by average cycle time:</FilterText>
      <RangeSliderContainer>
        <RangeSlider
          value={[min, max]}
          max={filterRange.max}
          min={filterRange.min}
          onChange={([min, max]) => {
            updateFilter({ min, max });
          }}
          renderTooltip={(v) => `${v} seconds`}
          /** Unfortunately we can't add labels without having steps */
          step={10}
          graduated
          /**
           * Render a label for every 20 seconds, offset by 5 (see above docstring)
           */
          renderMark={(mark) => {
            if ([15, 185].includes(mark)) {
              return <NonSelectable>{mark}s</NonSelectable>;
            }
            if ([15, 35, 55, 75, 95, 115, 135, 185].includes(mark)) {
              return <NonSelectable>{mark}</NonSelectable>;
            }
            return null;
          }}
        />
      </RangeSliderContainer >
    </FilterContainer>
  );
}
const NonSelectable = styled.span`
  user-select: none;
  `;