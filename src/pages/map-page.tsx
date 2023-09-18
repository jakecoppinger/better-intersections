import React from "react";
import ReactMapGL, {
  MapboxMap,
  AttributionControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
  ViewStateChangeEvent,
} from "react-map-gl";
import "../App.css";
import { MapInfoBox } from "../components/MapInfoBox";
import { IntersectionFilterState, IntersectionStats } from "../types";

import "mapbox-gl/dist/mapbox-gl.css";
import IntersectionCard from "../components/IntersectionCard";
import {
  averageIntersectionTotalRedDuration,
  getIntersections,
  getMarkerColour,
  getMaxCycleTime,
  getNextLargestMultipleOf5,
} from "../utils/utils";
import { LoadingTag } from "../styles/map-page.style";
import IntersectionFilter from "../components/IntersectionFilter";

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
  const defaultMinMax = { min: 15, max: 185 };

  const [{ min, max }, setCycleTimeFilter] =
    React.useState<IntersectionFilterState>(defaultMinMax);

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

  const minMaxCycleTimes = {
    min: defaultMinMax.min,
    max: getNextLargestMultipleOf5(
      state.points
        ? getMaxCycleTime(state.points) || defaultMinMax.max
        : defaultMinMax.max
    ),
  };

  return (
    <div id="container">
      <div id="search_overlay">
        <MapInfoBox />
      </div>
      <IntersectionFilter
        filterRange={minMaxCycleTimes}
        min={min}
        max={max}
        updateFilter={setCycleTimeFilter}
      />
      <div id="map">
        {state.points === undefined && <LoadingTag>Loading data...</LoadingTag>}
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
          <AttributionControl compact={false} />
          <FullscreenControl position="bottom-right" />
          <GeolocateControl position="bottom-right" />
          {/* <NavigationControl position="bottom-right" /> */}
          {state.points
            ? state.points.map((intersection: IntersectionStats) => {
                const totalRedDuration =
                  averageIntersectionTotalRedDuration(intersection);

                /* Check that the current intersection is within the cycle time filter range */
                if (totalRedDuration >= min && totalRedDuration <= max) {
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
                      color={getMarkerColour(totalRedDuration)}
                    />
                  );
                }
                return null;
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
