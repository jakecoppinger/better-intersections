import { useState, useEffect } from "react";
import { Map as MapboxMap } from "react-map-gl/node_modules/@types/mapbox-gl/index";
import {
  AttributionControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
  ViewStateChangeEvent,
  Map,
} from "react-map-gl/dist/esm/exports-mapbox";
import "../App.css";
import { MapInfoBox } from "../components/MapInfoBox";
import {
  DisplayMode,
  IntersectionFilterState,
  IntersectionStats,
  IntersectionStatsWithComputed,
} from "../types";
import "mapbox-gl/dist/mapbox-gl.css";
import { IntersectionCard } from "../components/IntersectionCard";
import {
  getIntersections,
  getCycleTimeMarkerColour,
  getMaxCycleTime,
  getNextLargestMultipleOf5,
  getMaxWaitMarkerColour,
} from "../utils/utils";
import { IntersectionFilter } from "../components/IntersectionFilter";
import { LoadingIndicator } from "../components/LoadingIndicator";
import { computedNodeProperties } from "../utils/computed-node-properties";
import { Helmet } from "react-helmet-async";
import { mapboxToken } from "../config";


interface State {
  // viewport: {
  //   longitude: number;
  //   latitude: number; // starting position
  //   zoom: number;
  //   // height: number;
  //   // width: number;
  // };
  map?: MapboxMap | undefined;
  points?: IntersectionStatsWithComputed[];
  markers?: mapboxgl.Marker[];
}

const params = new URLSearchParams(window.location.search);
const paramLat = params.get("lat");
const paramLon = params.get("lon");
const paramZoom = params.get("zoom");

const latitude = paramLat ? parseFloat(paramLat) : -33.8688;
const longitude = paramLon ? parseFloat(paramLon) : 151.1593;
const zoom: number = paramZoom ? parseFloat(paramZoom) : 11;

// TODO: Consolidate or break out state
const initialState: State = {};

type Viewport = {
  longitude: number;
  latitude: number; // starting position
  zoom: number;
};

export function MapComponent() {
  const [state, setState] = useState<State>(initialState);
  const [popupIntersection, setPopupIntersection] = useState<
    IntersectionStats | undefined
  >(undefined);

  const [showPopup, setShowPopup] = useState(false);

  const [viewport, setViewport] = useState<Viewport>({
    longitude,
    latitude, // starting position
    zoom,
  });
  const defaultMinMax = { min: 15, max: 185 };

  const [{ min, max }, setCycleTimeFilter] =
    useState<IntersectionFilterState>(defaultMinMax);

  const [displayMode, setDisplayMode] = useState<DisplayMode>("avg_cycle_time");
  useEffect(() => {
    async function getIntersectionsWrapper() {
      const intersections = await getIntersections();
      const richIntersections = await computedNodeProperties(intersections, true);
      setState((s) => ({
        ...s,
        points: richIntersections,
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
      <Helmet prioritizeSeoTags>
        <title>Better Intersections</title>
        <meta property="og:title" content="Better Intersections" />
        <meta name="description" content="Better Intersections is a crowdsourced pedestrian traffic light timing map that works all over the world, with a focus on Sydney, Australia."/>
      </Helmet>

      <MapInfoBox />
      <IntersectionFilter
        filterRange={minMaxCycleTimes}
        min={min}
        max={max}
        updateFilter={setCycleTimeFilter}
        displayMode={displayMode}
        updateDisplaymode={(newDisplayMode: DisplayMode) => {
          setDisplayMode(newDisplayMode);
        }}
      />
      <div id="map">
        {state.points === undefined && <LoadingIndicator></LoadingIndicator>}
        <Map
          initialViewState={viewport}
          mapboxAccessToken={mapboxToken}
          id={"react-map"}
          style={{ width: "100vw", height: "100vh" }}
          mapStyle="mapbox://styles/mapbox/streets-v12"
          ref={(ref) =>
            ref && !state.map && setState({ ...state, map: ref.getMap() })
          }
          onMoveEnd={onMoveEnd}
          attributionControl={false}
        >
          <AttributionControl compact={false} />
          <FullscreenControl position="bottom-right" />
          <GeolocateControl position="bottom-right" />
          {state.points
            ? state.points.map((intersection) => {
              const {averageCycleTime, averageFlashingAndSolidRedDuration} = intersection;

              /* Check that the current intersection is within the cycle time filter range */
              if (averageCycleTime >= min && averageCycleTime <= max) {
                const markerColor =
                  displayMode === "max_ped_wait_time"
                    ? getMaxWaitMarkerColour({maxWait: averageFlashingAndSolidRedDuration})
                    : getCycleTimeMarkerColour(averageCycleTime);
                return (
                  <Marker
                    key={`${intersection.osmId}-${markerColor}`}
                    latitude={intersection.lat}
                    longitude={intersection.lon}
                    onClick={() => {
                      setPopupIntersection(intersection);
                      if (!showPopup) {
                        setShowPopup(true);
                      }
                    }}
                    color={markerColor}
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
        </Map>
      </div>
    </div>
  );
}
