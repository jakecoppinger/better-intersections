import React, { useState, useRef, useCallback } from "react";
import ReactMapGL, {
  NavigationControl,
  MapboxMap,
  AttributionControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
  ViewStateChangeEvent,
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
  getColourForTotalRedDuration,
} from "../utils/utils";
import GeocoderControl from "../utils/geocoder-control";
import { LoadingTag } from "../styles/map-page.style";

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
  const [popupIntersection, setPopupIntersection] = React.useState<
    IntersectionStats | undefined
  >(undefined);

  const [showPopup, setShowPopup] = React.useState(false);

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

  const onMoveEnd = (e: ViewStateChangeEvent) => {
    const { latitude, longitude, zoom } = e.viewState;

    const location = window.location.origin;
    const fractionDigits = 4;

    window.history.pushState(
      {
        id: "homepage",
      },
      "",
      `${location}/?lat=${latitude.toFixed(
        fractionDigits
      )}&lon=${longitude.toFixed(fractionDigits)}&zoom=${zoom.toFixed(
        fractionDigits
      )}`
    );
  };

  return (
    <div id="container">
      <div id="search_overlay">
        <MapInfoBox />
      </div>
      <div id="map">
        {state.map === undefined && <LoadingTag>Loading data...</LoadingTag>}
        <ReactMapGL
          initialViewState={viewport}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100vw", height: "100vh" }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          ref={(ref) =>
            ref && !state.map && setState({ ...state, map: ref.getMap() })
          }
          onMoveEnd={onMoveEnd}
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
                      setPopupIntersection(intersection);
                      if (!showPopup) {
                        setShowPopup(true);
                      }
                    }}
                    color={getColourForTotalRedDuration(totalRedDuration)}
                  />
                );
              })
            : null}

          {showPopup && popupIntersection ? (
            <Popup
              latitude={popupIntersection.lat}
              longitude={popupIntersection.lon}
              onClose={() => {
                setPopupIntersection(undefined);
                setShowPopup(false);
              }}
              offset={25}
            >
              <IntersectionCard intersection={popupIntersection} />
            </Popup>
          ) : null}
          {/* Todo add search  */}
        </ReactMapGL>
      </div>
    </div>
  );
}
