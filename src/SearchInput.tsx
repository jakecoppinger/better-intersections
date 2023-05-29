import React, { FunctionComponent } from "react";

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
        You can contribute data with a simple form!{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://forms.gle/3FFGD5Jk14wUS22n6"
        >
          See here
        </a>
      </p>
      <p>
        Open data (<a href="https://opendatacommons.org/licenses/odbl/">ODbL</a>
        ) and open-source (
        <a href="https://creativecommons.org/licenses/by-nc-sa/4.0/">
          CC-BY-NC-SA
        </a>
        , contribute on{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://github.com/jakecoppinger/better-intersections"
        >
          Github
        </a>
        )
      </p>
      <p>
        A side project by{" "}
        <a
          target="_blank"
          rel="noopener noreferrer"
          href="https://jakecoppinger.com"
        >
          Jake Coppinger
        </a>
      </p>
    </>
  );
};
