import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import AboutPage from "./pages/about-page";
import { render } from "react-dom";
import React from "react";
import "./index.css";
import { MapComponent as MapPage } from "./pages/map-page";
import IntersectionNodePage, {
  nodeIdLoader,
} from "./pages/intersection-node-page";

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
    path: "/intersection/node/:nodeId",
    element: <IntersectionNodePage />,
    loader: nodeIdLoader,
  },
]);

render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById("root")
);
