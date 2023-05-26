import React, { FunctionComponent} from "react";

type SearchInputProps = {
  onSearchTermUpdated: (term: string) => void;
};

export const SearchInput: FunctionComponent<SearchInputProps> = ({
  onSearchTermUpdated,
}) => {
  return (
    <>
      <h2>Better Intersections</h2>
      <h3>A pedestrian traffic light timing map</h3>

      <p>
        Very work in progress - I built this in an afternoon.<br></br> You can contribute data with a simple form!{" "}
        <a href="https://forms.gle/3FFGD5Jk14wUS22n6">See here</a>
      </p>
      <p>A side project by <a href="https://jakecoppinger.com">Jake Coppinger</a></p>
      <p>
        Open source website (
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
          CC-BY-NC-SA
        </a>
        ) and open data (under{" "}
        <a href="https://opendatacommons.org/licenses/odbl/">ODbL</a>)
      </p>
    </>
  );
};
