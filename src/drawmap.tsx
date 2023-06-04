import React from "react";
import { debounce } from "ts-debounce";
import mapboxgl from "mapbox-gl";
import { renderToString } from "react-dom/server";
import IntersectionCard from "./Card";

import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";

import "@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css";

import GSheetReader from "g-sheets-api";
import { FormResponse, IntersectionStats } from "./types";
import { averageIntersectionCycleTime, moveEndCallback } from "./utils";

const options = {
  apiKey: "AIzaSyCr3HYpVAJ1iBlb_IjbK_KbltnC0T8C6hY",
  // This is a public Google Sheet, with results copied from a private sheet (excluding emails)
  sheetId: "1L08GNolPYjiRwLOL2d3lAZPqwCNe5vGr6SAOtH7hnNM",
  sheetName: "Sheet1",
  returnAllResults: true,
};
export function getDataFromSheet(): Promise<FormResponse[]> {
  return new Promise((resolve, reject) => {
    GSheetReader(
      options,
      (results: any) => {
        resolve(results);
      },
      (error: any) => {
        reject(error);
      }
    );
  });
}

const clamp = (num: number, min: number, max: number) =>
  Math.min(Math.max(num, min), max);

export function drawIntersectionMarker(
  intersection: IntersectionStats,
  map: mapboxgl.Map
): mapboxgl.Marker {
  const { lat, lon } = intersection;
  const cycleTime = averageIntersectionCycleTime(intersection);
  var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
    renderToString(<IntersectionCard intersection={intersection} />)
  );

  let markerOptions: { color?: string } = {};
  
  const cycleColourCliffs: { [key: number]: string } = {
    // Alternative colours
    // 30: "#29FF08",
    // 45: "#C5DE07",
    // 60: "#F5CB13",
    // 90: "#E08804",
    // 120: "#FA5814",

    30: "#ff0000",
    45: "#fc4f00",
    60: "#f27600",
    90: "#e29700",
    100: "#cab500",
    120: "#aad000",
    160: "#7de800",
    180: "#00ff00",
  };

  // Cliffs keys sorted low to high
  const cycleColourCliffKeys: number[] = Object.keys(cycleColourCliffs)
    .map((key) => parseInt(key))
    // Sort by smallest to largest number
    .sort((a, b) => a - b);

  // Iterate over the colour cliff keys and to find the smallest one larger than the cycle time
  for (let i = 0; i < cycleColourCliffKeys.length; i++) {
    const key = cycleColourCliffKeys[i];
    if (cycleTime <= key) {
      markerOptions.color = cycleColourCliffs[key];
      break;
    }
  }
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
    .setLngLat({ lat, lon })
    .setPopup(popup) // sets a popup on this marker
    .addTo(map);
}

export function addMapControls(map: mapboxgl.Map): void {
  map.addControl(
    new mapboxgl.AttributionControl({
      compact: false,
    })
  );
  map.addControl(new mapboxgl.NavigationControl());
  map.addControl(new mapboxgl.FullscreenControl());

  // Add a mapbox search control to the map
  map.addControl(
    new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
    }),
    "bottom-left"
  );

  // Add geolocate control to the map.
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
    })
  );

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
  map: mapboxgl.Map,
  points: IntersectionStats[]
): mapboxgl.Marker[] {
  const markers = points
    .filter((intersection) => intersection.lat && intersection.lon)
    .map((intersection: IntersectionStats) => {
      return drawIntersectionMarker(intersection, map);
    });

  return markers;
}
