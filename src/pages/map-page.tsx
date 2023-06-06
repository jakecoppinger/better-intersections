import * as React from "react";
import ReactMapGL, { NavigationControl, MapboxMap, AttributionControl, FullscreenControl, GeolocateControl, Marker } from "react-map-gl";
import "../App.css";
import {
  drawIntersectionMarkers,
  removeMarkers,
  addMapControls,
} from "../drawmap";
import { MapInfoBox } from "../components/MapInfoBox";
import { IntersectionStats } from "../types";
import { getIntersections } from "../api/google-sheets";

import 'mapbox-gl/dist/mapbox-gl.css';
import MapboxGeocoder from "@mapbox/mapbox-gl-geocoder";
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiamFrZWMiLCJhIjoiY2tkaHplNGhjMDAyMDJybW4ybmRqbTBmMyJ9.AR_fnEuka8-cFb4Snp3upw";

interface State {
  viewport: {
    longitude: number;
    latitude: number; // starting position
    zoom: number;
    // height: number;
    // width: number;
  };
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

const initialState: State = {
  viewport: {
    longitude,
    latitude, // starting position
    zoom,
  },
};

type Viewport = typeof initialState.viewport;

// export class Map extends React.Component<{}, State> {
//   public state: State = initialState;

//   async componentDidMount() {
//     window.addEventListener("resize", this.resize);
//     this.resize();
//     const intersections = await getIntersections();
//     this.setState({
//       points: intersections,
//       // Initially, show all points
//       filteredPoints: intersections,
//     });
//   }

//   async UNSAFE_componentWillUpdate(nextProps: any, nextState: State) {
//     if (!nextState.map || !nextState.filteredPoints) {
//       return;
//     }
//     // If we haven't drawn any markers before, draw them AND the map
//     if (!this.state.markers && !nextState.markers) {
//       console.log("Initial draw of map");
//       const { map, filteredPoints } = nextState;
//       addMapControls(map);
//       const markers = drawIntersectionMarkers(map, filteredPoints);
//       this.setState({
//         markers,
//       });
//     }
//     // If we HAVE drawn markers before, and the points are different, remove then draw them
//     if (
//       this.state.markers &&
//       this.state.filteredPoints !== nextState.filteredPoints
//     ) {
//       console.log("Redrawing markers");
//       const { map, filteredPoints } = nextState;
//       removeMarkers(this.state.markers);
//       const markers = drawIntersectionMarkers(map, filteredPoints);
//       this.setState({
//         markers,
//       });
//     }
//   }

//   public componentWillUnmount() {
//     window.removeEventListener("resize", this.resize);
//   }

//   public async componentWillMount() {}
//   public updateViewport = (viewport: Viewport) => {
//     this.setState((prevState) => ({
//       viewport: { ...prevState.viewport, ...viewport },
//     }));
//   };

//   public resize = () => {
//     this.setState((prevState) => ({
//       viewport: {
//         ...prevState.viewport,
//         height: window.innerHeight,
//         // width: window.innerWidth,
//       },
//     }));
//   };

//   public render() {
//     const { viewport } = this.state;
//     return (
//       <div id="container">
//         <div id="search_overlay">
//           <MapInfoBox />
//         </div>
//         <div id="map">
//           <ReactMapGL
//             width={"100%"}
//             height={"100%"}
//             className={"mapClass"}
//             {...viewport}
//             mapStyle={"mapbox://styles/mapbox/streets-v11"}
//             ref={(ref) =>
//               ref && !this.state.map && this.setState({ map: ref.getMap() })
//             }
//             mapboxApiAccessToken={MAPBOX_TOKEN}
//             onViewportChange={(v: Viewport) => this.updateViewport(v)}
//             attributionControl={false}
//           >
//             <div style={{ position: "absolute", right: 30, bottom: 30 }}>
//               <NavigationControl onViewportChange={this.updateViewport} />
//             </div>
//           </ReactMapGL>

//         </div>
//       </div>
//     );
//   }
// }

export function MapComponent() {
  const [state, setState] = React.useState<State>(initialState);

  React.useEffect(() => {
    if (!state.map) {
      return;
    }

    addMapControls(state.map);
  }, [state.map]);


  React.useEffect(() => {
    if (!state.map || !state.filteredPoints) {
      return;
    }
    if (!state.markers) {
      console.log("Initial draw of map");
      addMapControls(state.map);
      const markers = drawIntersectionMarkers(state.map, state.filteredPoints);
      setState({ ...state, markers });
    } 
    // else {
    //   console.log("Redrawing markers");
    //   removeMarkers(state.markers);
    //   const markers = drawIntersectionMarkers(state.map, state.filteredPoints);
    //   setState({ ...state, markers });
    // }
  }, [state.map, state.filteredPoints, state.markers]);


  return (
    <div id="container">
      <div id="search_overlay">
        <MapInfoBox />
      </div>
      <div id="map">
        <ReactMapGL
          initialViewState={state.viewport}
          mapboxAccessToken={MAPBOX_TOKEN}
          style={{ width: "100vw", height: "100vh" }}
          mapStyle="mapbox://styles/mapbox/streets-v9"
          ref={(ref) =>
            ref && !state.map && setState({ ...state, map: ref.getMap() })
          }
          attributionControl={false}
        >
          <AttributionControl compact={false}/>
          <FullscreenControl />
          <GeolocateControl />
          <NavigationControl/>
          <Marker latitude={-33.8688} longitude={151.1593}/>
          {/* Todo add search  */}
        </ReactMapGL>
      </div>
    </div>
  );
}
