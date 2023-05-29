import React from "react";
import mapboxgl from "mapbox-gl";
import { renderToString } from "react-dom/server";
import IntersectionCard from "./Card";

import GSheetReader from "g-sheets-api";
import { FormResponse, IntersectionStats, TrafficLightReport } from "./types";
import { averageIntersectionCycleTime } from "./utils";

const options = {
  apiKey: "AIzaSyCr3HYpVAJ1iBlb_IjbK_KbltnC0T8C6hY",
  sheetId: "12HwTj8Bi_7J5idIi4OWHMknTx1DkNVHqfpPlRxRJG_w",
  // sheetNumber: 1,
  sheetName: "Form Responses 1", // if sheetName is supplied, this will take precedence over sheetNumber
  returnAllResults: true,
  // returnAllResults: false,
  // filter: {
  //   'department': 'archaeology',
  //   'module description': 'introduction'
  // },
  // filterOptions: {
  //   operator: 'or',
  //   matching: 'loose'
  // }
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

export function drawmap(map: mapboxgl.Map): void {
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

  // TODO: Fix this - fires many times per move
  // map.on('moveend', function (originalEvent) {
  //   const { lat, lng } = map.getCenter();
  //   console.log('A moveend event occurred.');
  //   console.log({ lat, lng })

  //   // eg https://localhost:3000
  //   const location = window.location.origin
  //   console.log({ location });

  //   // @ts-ignore
  //   window.history.pushState({
  //     id: 'homepage'
  //   }, 'Home | My App', `${location}/?lat=${lat}&lon=${lng}`);
  // });
}

export function removeMarkers(markers: mapboxgl.Marker[]): void {
  markers.map((marker) => marker.remove());
}

export function drawMarkers(
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
