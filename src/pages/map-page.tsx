import React, { useState, useRef, useCallback } from "react";
import ReactMapGL, {
  NavigationControl,
  MapboxMap,
  AttributionControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
} from "react-map-gl";
// @ts-ignore
import Geocoder from "react-map-gl-geocoder";
import "react-map-gl-geocoder/dist/mapbox-gl-geocoder.css";
import "../App.css";
import { MapInfoBox } from "../components/MapInfoBox";
import { IntersectionStats } from "../types";
import { getIntersections } from "../api/google-sheets";

import "mapbox-gl/dist/mapbox-gl.css";
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
import { IntersectionType } from "typescript";
import IntersectionCard from "../components/IntersectionCard";
import {
  averageIntersectionTotalRedDuration,
  coordinateFloatTolerance,
  getColourForTotalRedDuration,
} from "../utils/utils";
import GeocoderControl from "../utils/geocoder-control";

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiamFrZWMiLCJhIjoiY2tkaHplNGhjMDAyMDJybW4ybmRqbTBmMyJ9.AR_fnEuka8-cFb4Snp3upw";

interface State {
  // viewport: {
  //   longitude: number;
  //   latitude: number; // starting position
  //   zoom: number;
  //   // height: number;
  //   // width: number;
  // };
  map?: MapboxMap | undefined;
  points?: IntersectionStats[];
  markers?: mapboxgl.Marker[];
  filteredPoints?: IntersectionStats[];
}

const params = new URLSearchParams(window.location.search);
const paramLat = params.get("lat");
const paramLon = params.get("lon");
const paramZoom = params.get("zoom");

const latitude = paramLat ? parseFloat(paramLat) : -33.8688;
const longitude = paramLon ? parseFloat(paramLon) : 151.1593;
const zoom: number = paramZoom ? parseFloat(paramZoom) : 11;

console.log({ lat: paramLat, lon: paramLon });

// TODO: Consolidate or break out state
const initialState: State = {};

// type Viewport = typeof initialState.viewport;
type Viewport = {
  longitude: number;
  latitude: number; // starting position
  zoom: number;
};

export function MapComponent() {
  const [state, setState] = React.useState<State>(initialState);
  // const [popupIntersection, setPopupIntersection] = React.useState<
  //   IntersectionStats | undefined
  // >(undefined);

  /** Either the intersection id of an active popup, or null if popup closed */
  const [activePopup, setActivePopup] =
    React.useState<IntersectionStats | null>(null);

  /** If we click on a new marker, set this so we know not to close instantly */
  const [ignoreNextPopupClose, setIgnoreNextPopupClose] =
    React.useState<boolean>(false);

  const [viewport, setViewport] = React.useState<Viewport>({
    longitude,
    latitude, // starting position
    zoom,
  });

  React.useEffect(() => {
    async function getIntersectionsWrapper() {
      const intersections = await getIntersections();
      setState((s) => ({
        ...s,
        points: intersections.filter(
          (intersection) => intersection.lat && intersection.lon
        ),
        // Initially, show all points
        // filteredPoints: intersections,
      }));
    }
    getIntersectionsWrapper();
  }, []);

  const handleViewportChange = useCallback(
    (newViewport: Viewport) => setViewport(newViewport),
    []
  );

  // if you are happy with Geocoder default settings, you can just use handleViewportChange directly
  const handleGeocoderViewportChange = useCallback((newViewport: Viewport) => {
    const geocoderDefaultOverrides = { transitionDuration: 1000 };

    return handleViewportChange({
      ...newViewport,
      ...geocoderDefaultOverrides,
    });
  }, []);

  return (
    <div id="container">
      <div id="search_overlay">
        <MapInfoBox />
      </div>
      <div id="map">
        <ReactMapGL
          initialViewState={viewport}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100vw", height: "100vh" }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          ref={(ref) =>
            ref && !state.map && setState({ ...state, map: ref.getMap() })
          }
          attributionControl={false}
        >
          <GeocoderControl
            mapboxAccessToken={MAPBOX_TOKEN}
            position="bottom-left"
          />
          <AttributionControl compact={false} />
          <FullscreenControl position="bottom-right" />
          <GeolocateControl position="bottom-right" />
          <NavigationControl position="bottom-right" />
          {state.points
            ? state.points.map((intersection: IntersectionStats) => {
                const totalRedDuration =
                  averageIntersectionTotalRedDuration(intersection);
                return (
                  <Marker
                    key={intersection.osmId}
                    latitude={intersection.lat}
                    longitude={intersection.lon}
                    onClick={() => {
                      console.log("In marker onclick for ", intersection.osmId);
                      if (activePopup !== null) {
                        setIgnoreNextPopupClose(true);
                      }
                      console.log('setting active popup to ', intersection.osmId);
                      setActivePopup(intersection);
                    }}
                    color={getColourForTotalRedDuration(totalRedDuration)}
                  />
                );
              })
            : null}

          {activePopup ? (
            <Popup
              latitude={activePopup.lat}
              longitude={activePopup.lon}
              closeOnClick={false}
              onClose={(m) => {
                console.log("In marker onclose ");
                console.log({ ignoreNextPopupClose });
                if (ignoreNextPopupClose) {
                  setIgnoreNextPopupClose(false);
                }
                // setActivePopup(null);
              }}
              offset={25}
            >
              <IntersectionCard intersection={activePopup} />
            </Popup>
          ) : null}
          {/* Todo add search  */}
        </ReactMapGL>
      </div>
    </div>
  );
}
