import { useState, useEffect } from "react";
import { Map as MapboxMap } from "react-map-gl/node_modules/@types/mapbox-gl/index";
import {
  AttributionControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
  ViewStateChangeEvent,
  Map
} from "react-map-gl/dist/esm/exports-mapbox"
import "../App.css";
import { MapInfoBox } from "../components/MapInfoBox";
import { DisplayMode, IntersectionFilterState, IntersectionStats } from "../types";
import "mapbox-gl/dist/mapbox-gl.css";
import { IntersectionCard } from "../components/IntersectionCard";
import {
  averageIntersectionTotalRedDuration,
  getIntersections,
  getCycleTimeMarkerColour,
  getMaxCycleTime,
  getNextLargestMultipleOf5,
  getMaxWaitMarkerColour,
  averageIntersectionMaxWait,
} from "../utils/utils";
import { IntersectionFilter } from "../components/IntersectionFilter";
import { LoadingIndicator } from "../components/LoadingIndicator";

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
      <MapInfoBox />
      <IntersectionFilter
        filterRange={minMaxCycleTimes}
        min={min}
        max={max}
        updateFilter={setCycleTimeFilter}
        displayMode={displayMode}
        updateDisplaymode={(newDisplayMode: DisplayMode) => { setDisplayMode(newDisplayMode) }}
      />
      <div id="map">
        {state.points === undefined && <LoadingIndicator></LoadingIndicator>}
        <Map
          initialViewState={viewport}
          mapboxAccessToken={MAPBOX_TOKEN}
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
            ? state.points.map((intersection: IntersectionStats) => {
              const totalRedDuration =
                averageIntersectionTotalRedDuration(intersection);

              /* Check that the current intersection is within the cycle time filter range */
              if (totalRedDuration >= min && totalRedDuration <= max) {
                const markerColor = displayMode === 'max_ped_wait_time'
                  ? getMaxWaitMarkerColour(averageIntersectionMaxWait(intersection))
                  : getCycleTimeMarkerColour(totalRedDuration)
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
