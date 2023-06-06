import React from "react";
import ReactMapGL, { NavigationControl, MapboxMap, Marker} from "react-map-gl";
import { debounce } from "ts-debounce";
import mapboxgl from "mapbox-gl";
import { renderToString } from "react-dom/server";
import IntersectionCard from "./components/IntersectionCard";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";


import { IntersectionStats } from "./types";
import { averageIntersectionCycleTime, moveEndCallback } from "./utils/utils";


export function addMapControls(map: MapboxMap): void {
  console.log("addMapControls");
  // map.addControl(
  //   new MapboxAttributionControl({
  //     compact: false,
  //   })
  // );
  // map.addControl(new mapboxgl.NavigationControl());
  // map.addControl(new mapboxgl.FullscreenControl());

  // Add a mapbox search control to the map
  // map.addControl(
  //   new MapboxGeocoder({
  //     accessToken: mapboxgl.accessToken,
  //     mapboxgl: mapboxgl,
  //   }),
  //   "bottom-left"
  // );

  // Add geolocate control to the map.
  // map.addControl(
  //   new mapboxgl.GeolocateControl({
  //     positionOptions: {
  //       enableHighAccuracy: true,
  //     },
  //   })
  // );

  const debouncedMoveEndCallback = debounce(moveEndCallback, 200, {});

  map.on("moveend", function (originalEvent) {
    console.log(originalEvent);
    console.log("A moveend event occurred.");
    debouncedMoveEndCallback({ centre: map.getCenter(), zoom: map.getZoom() });
  });
}

export function removeMarkers(markers: mapboxgl.Marker[]): void {
  markers.map((marker) => marker.remove());
}
