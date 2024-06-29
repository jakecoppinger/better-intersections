
import { useEffect, useRef } from "react";
import * as Plot from "@observablehq/plot";

/**
 * See docs:
 * https://observablehq.com/plot/features/plots
 */
export function PlotFigure({ options }: {options: Plot.PlotOptions}) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (options == null) {
      return;
    }
    const {current} = containerRef;
    if(current === null) {
      return;
    }
    const plot = Plot.plot(options);
    current.append(plot);
    return () => plot.remove();
  }, [options]);

  return <div ref={containerRef} />;
}
// export function RectFigure({ data, options }: {data: Plot.Data | undefined, options: Plot.RectOptions }) {
//   const containerRef = useRef<HTMLDivElement | null>(null);

//   useEffect(() => {
//     if (options == null) {
//       return;
//     }
//     const {current} = containerRef;
//     if(current === null) {
//       return;
//     }
//     const plot = Plot.rect(data, options).plot(
//       {color: {scheme: "turbo"}}
//     );
//     current.append(plot);
//     return () => plot.remove();
//   }, [options, data]);

//   return <div ref={containerRef} />;
// }