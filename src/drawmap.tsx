import React from "react";
import mapboxgl from "mapbox-gl";
import { renderToString } from "react-dom/server";
import Card from "./Card";

// const GSheetReader = require('g-sheets-api');
import GSheetReader from "g-sheets-api";
import { FormResponse, TrafficLightReport } from "./types";

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

export function drawMarker(
  item: TrafficLightReport,
  map: mapboxgl.Map
): mapboxgl.Marker {
  const { lat, lon } = item;
  var popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
    renderToString(<Card item={item} />)
  );

  let markerOptions: { color?: string } = {};
  if (item.cycleTime < 30) {
    markerOptions.color = "lime";
  } else if (item.cycleTime < 45) {
    markerOptions.color = "green";
  } else if (item.cycleTime < 60) {
    markerOptions.color = "orange";
  } else if (item.cycleTime < 90) {
    markerOptions.color = "red";
  } else if (item.cycleTime < 120) {
    markerOptions.color = "purple";
  } else if (item.cycleTime >= 120) {
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
  //   }, 'Home | My App', `${location}/.../?lat=${lat}&lon=${lng}`);
  // });
}
export function removeMarkers(markers: mapboxgl.Marker[]): void {
  markers.map((marker) => marker.remove());
}

export function drawMarkers(
  map: mapboxgl.Map,
  points: TrafficLightReport[]
): mapboxgl.Marker[] {
  const markers = points
    .filter((point) => point.lat && point.lon)
    .map((feedbackItem: TrafficLightReport) => {
      return drawMarker(feedbackItem, map);
    });

  return markers;
}
