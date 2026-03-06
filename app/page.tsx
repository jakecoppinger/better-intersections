'use client';
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import mapboxgl from "mapbox-gl";
import {
  AttributionControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
  ViewStateChangeEvent,
  Map,
} from "react-map-gl/mapbox";
import "../src/App.css";

// Use the pre-built worker to avoid Turbopack transpilation breaking the WebWorker
mapboxgl.workerUrl = "/mapbox-gl-csp-worker.js";
import { MapInfoBox } from "../src/components/MapInfoBox";
import {
  DisplayMode,
  IntersectionFilterState,
  IntersectionStats,
  IntersectionStatsWithComputed,
} from "../src/types";
import "mapbox-gl/dist/mapbox-gl.css";
import { IntersectionCard } from "../src/components/IntersectionCard";
import {
  getIntersections,
  getCycleTimeMarkerColour,
  getMaxCycleTime,
  getNextLargestMultipleOf5,
  getMaxWaitMarkerColour,
} from "../src/utils/utils";
import { IntersectionFilter } from "../src/components/IntersectionFilter";
import { LoadingIndicator } from "../src/components/LoadingIndicator";
import { computedNodeProperties } from "../src/utils/computed-node-properties";
import { Helmet } from '@dr.pogodin/react-helmet';
import { mapboxToken } from "../src/config";


interface State {
  points?: IntersectionStatsWithComputed[];
  markers?: mapboxgl.Marker[];
}

// TODO: Consolidate or break out state
const initialState: State = {};

type Viewport = {
  longitude: number;
  latitude: number; // starting position
  zoom: number;
};

function MapComponent() {
  const searchParams = useSearchParams();
  const paramLat = searchParams.get("lat");
  const paramLon = searchParams.get("lon");
  const paramZoom = searchParams.get("zoom");

  const latitude = paramLat ? parseFloat(paramLat) : -33.8688;
  const longitude = paramLon ? parseFloat(paramLon) : 151.1593;
  const zoom: number = paramZoom ? parseFloat(paramZoom) : 11;

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
          onMoveEnd={onMoveEnd}
          attributionControl={false}
        >
          <AttributionControl compact={false} />
          <FullscreenControl position="bottom-right" />
          <GeolocateControl position="bottom-right" />
          {state.points
            ? state.points.map((intersection) => {
              const {averageCycleTime, averageFlashingAndSolidRedDuration} = intersection;

              const shouldPinBeVisible = (averageCycleTime >= min && averageCycleTime <= max)
                // If min/max is at default, show pins that are outside the default range.
                // Chances are these are invalid.
                || ((min < defaultMinMax.min + 0.1) && averageCycleTime < min)
                || ((max > defaultMinMax.max - 0.1) && averageCycleTime > max)
              /* Check that the current intersection is within the cycle time filter range */
              if (shouldPinBeVisible) {
                const markerColor =
                  displayMode === "max_ped_wait_time"
                    ? getMaxWaitMarkerColour({maxWait: averageFlashingAndSolidRedDuration})
                    : getCycleTimeMarkerColour(averageCycleTime);
                return (
                  <Marker
                    key={`${intersection.osmId}-${markerColor}`}
                    latitude={intersection.lat}
                    longitude={intersection.lon}
                    onClick={(e) => {
                      e.originalEvent.stopPropagation();
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

export default function Page() {
  return (
    <Suspense>
      <MapComponent />
    </Suspense>
  );
}
