import React from "react";
import ReactMapGL, { NavigationControl, MapboxMap, Marker} from "react-map-gl";
import { debounce } from "ts-debounce";
import mapboxgl from "mapbox-gl";
import { renderToString } from "react-dom/server";
import IntersectionCard from "./components/IntersectionCard";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import { IntersectionStats } from "./types";
import { averageIntersectionCycleTime, moveEndCallback } from "./utils/utils";




export function drawIntersectionMarker(
  intersection: IntersectionStats,
  map: MapboxMap
): mapboxgl.Marker {
  const { lat, lon } = intersection;
  var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
    renderToString(<IntersectionCard intersection={intersection} />)
  );

  let markerOptions: { color?: string } = {};
  
  if (markerOptions.color === undefined) {
    markerOptions.color = "black";
  }

  // First colours
  // if (cycleTime < 30) {
  //   markerOptions.color = "#29FF08";
  // } else if (cycleTime < 45) {
  //   markerOptions.color = "#C5DE07";
  // } else if (cycleTime < 60) {
  //   markerOptions.color = "#F5CB13";
  // } else if (cycleTime < 90) {
  //   markerOptions.color = "#E08804";
  // } else if (cycleTime < 120) {
  //   markerOptions.color = "#FA5814";
  // } else if (cycleTime >= 120) {
  //   markerOptions.color = "black";
  // }

  return new mapboxgl.Marker(markerOptions)
    // .setLngLat({ lat, lon })
    // .setPopup(popup) // sets a popup on this marker
    // .addTo(map);
}

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

export function drawIntersectionMarkers(
  map: MapboxMap,
  points: IntersectionStats[]
): mapboxgl.Marker[] {
  const markers = points
    .filter((intersection) => intersection.lat && intersection.lon)
    .map((intersection: IntersectionStats) => {
      return drawIntersectionMarker(intersection, map);
    });

  return markers;
}
