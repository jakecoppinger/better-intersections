import { RangeSlider } from "rsuite";
import { useState } from "react";
import {
  FilterContainer,
  FilterText,
} from "../styles/filter.style";
import "rsuite/dist/rsuite-no-reset.min.css";
import { DisplayMode, DisplayModeState, IntersectionFilterState } from "../types";

/**
 * React component for a cycle time filter.
 * The filter is a slider that allows the user to select a range of cycle times to display on the map.
 *
 * Can use in future to filter points by other attributes.
 */
export function IntersectionFilter(props: {
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
  updateDisplaymode: (newDisplayMode: DisplayMode) => void;
}) {
  const { filterRange, min, max, updateFilter, updateDisplaymode } = props;
  const [displayMode, setDisplayMode] = useState<DisplayMode>("avg_cycle_time");

  const handleDisplayModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newDisplayMode = event.target.value as DisplayMode;
    setDisplayMode(newDisplayMode);
    updateDisplaymode(newDisplayMode);
  };

  return (
    <div data-testid="intersection-filter-container">
      <div>
        <input
          type="radio"
          id="max-wait-time"
          name="display-mode"
          value="Max wait time"
          checked={displayMode === "max_ped_wait_time"}
          onChange={handleDisplayModeChange}
        />
        <label htmlFor="max-wait-time">Max wait time</label>
      </div>
      <div>
        <input
          type="radio"
          id="avg-cycle-time"
          name="display-mode"
          value="Avg cycle time"
          checked={displayMode === "avg_cycle_time"}
          onChange={handleDisplayModeChange}
        />
        <label htmlFor="avg-cycle-time">Avg cycle time</label>
      </div>

      <FilterContainer>
        <FilterText>Filter by cycle time (avg, seconds):</FilterText>
        <RangeSlider
          value={[min, max]}
          max={filterRange.max}
          min={filterRange.min}
          onChange={([min, max]) => {
            updateFilter({ min, max });
          }}
          renderTooltip={(v) => `${v}s`}
          /** Unfortunately we can't add labels without having steps */
          step={10}
          graduated
          /**
           * Render a label for every 20 seconds, offset by 5 (see above docstring)
           */
          renderMark={(mark) => {
            if ([15, 35, 55, 75, 95, 115, 135, 155, 185].includes(mark)) {
              return <span>{mark}</span>;
            }
            return null;
          }}
        />
      </FilterContainer>
    </div >
  );
}
