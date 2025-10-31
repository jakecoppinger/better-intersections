import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import AboutPage from "./pages/about-page";
import React from "react";
import "./index.css";
import { MapComponent as MapPage } from "./pages/map-page";
import { ContributeMeasurementPage } from "./pages/contribute-measurement-page";
import IntersectionNodePage, {
  nodeIdLoader,
} from "./pages/intersection-node-page";
import Analysis from "./pages/analysis";
import { HelmetProvider } from '@dr.pogodin/react-helmet';
import ReactDOM from "react-dom/client";


const router = createBrowserRouter([
  {
    path: "/",
    element: <MapPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
  {
    path: "/contribute-measurement",
    element: <ContributeMeasurementPage />,
  },
  {
    path: "/intersection/node/:nodeId",
    element: <IntersectionNodePage />,
    loader: nodeIdLoader,
  },
  {
    path: "/analysis",
    element: <Analysis />,
  },
  {
    path: "/contribute-measurement/:nodeId",
    element: <ContributeMeasurementPage />,
  },
]);


const containerId = "root";
const container = document.getElementById(containerId);
if (!container) {
  console.error(`Failed to find the root element ${containerId}`);
  throw new Error('Unable to load the map. Please contact the Heart Foundation.');
}

ReactDOM.createRoot(container).render(
  <React.StrictMode>
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  </React.StrictMode>
);
