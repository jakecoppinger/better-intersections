import React from "react";
import { debounce } from "ts-debounce";
import mapboxgl from "mapbox-gl";
import { renderToString } from "react-dom/server";
import IntersectionCard from "./Card";

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
  // TODO: Automate this based on a map of thresholds and colours
  if (cycleTime < 30) {
    markerOptions.color = "lime";
  } else if (cycleTime < 45) {
    markerOptions.color = "green";
  } else if (cycleTime < 60) {
    markerOptions.color = "orange";
  } else if (cycleTime < 90) {
    markerOptions.color = "red";
  } else if (cycleTime < 120) {
    markerOptions.color = "purple";
  } else if (cycleTime >= 120) {
    markerOptions.color = "black";
  }

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

  // Add geolocate control to the map.
  map.addControl(
    new mapboxgl.GeolocateControl({
      positionOptions: {
        enableHighAccuracy: true,
      },
      trackUserLocation: true,
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
