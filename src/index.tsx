import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import AboutPage from "./pages/about-page";
import { render } from "react-dom";
import React from "react";
import "./index.css";
import { Map as MapPage } from "./pages/map-page";

const router = createBrowserRouter([
  {
    path: "/",
    element: <MapPage />,
  },
  {
    path: "/about",
    element: <AboutPage />,
  },
]);

render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>,
  document.getElementById("root")
);
