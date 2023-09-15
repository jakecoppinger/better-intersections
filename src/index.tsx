import { createBrowserRouter, RouterProvider } from "react-router-dom";
import "./index.css";

import AboutPage from "./pages/about-page";
import { render } from "react-dom";
import React from "react";
import "./index.css";
import { MapComponent as MapPage } from "./pages/map-page";
import ContributeMeasurement from "./pages/contribute-measurment";
import IntersectionNodePage, {
  nodeIdLoader,
} from "./pages/intersection-node-page";
import LongestAndShortestWaits from "./pages/longest-and-shortest-waits-page";
import {
  ClerkProvider,
} from "@clerk/clerk-react";

if (!process.env.REACT_APP_CLERK_PUBLISHABLE_KEY) {
  throw new Error("Missing Publishable Key");
}

const clerkPubKey = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY;
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
    element: <ContributeMeasurement />,
  },
  {
    path: "/intersection/node/:nodeId",
    element: <IntersectionNodePage />,
    loader: nodeIdLoader,
  },
  {
    path: "/longest-and-shortest-waits",
    element: <LongestAndShortestWaits />,
  },
]);

render(
  <React.StrictMode>
    <ClerkProvider publishableKey={clerkPubKey}>
      <RouterProvider router={router} />
    </ClerkProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
