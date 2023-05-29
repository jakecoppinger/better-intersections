import * as React from "react";
import ReactMapGL, { NavigationControl } from "react-map-gl";
import mapboxgl from "mapbox-gl";
import "./App.css";
import {
  getDataFromSheet,
  drawIntersectionMarkers,
  removeMarkers,
  addMapControls,
} from "./drawmap";
import { SearchInput } from "./SearchInput";
import {
  convertToTrafficLightReport,
  isValidTrafficLightReport,
  summariseReportsByIntersection,
} from "./utils";
import { IntersectionStats, TrafficLightReport } from "./types";

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
  map?: mapboxgl.Map;
  points?: IntersectionStats[];
  markers?: mapboxgl.Marker[];
  filteredPoints?: IntersectionStats[];
}

const params = new URLSearchParams(window.location.search);
const paramLat = params.get("lat");
const paramLon = params.get("lon");
const paramZoom = params.get("zoom");

const latitude = paramLat ? parseFloat(paramLat) : -33.8688;
const longitude = paramLon ? parseFloat(paramLon) : 151.2093;
const zoom: number = paramZoom ? parseFloat(paramZoom) : 13;

console.log({ lat: paramLat, lon: paramLon });

const initialState: State = {
  viewport: {
    longitude,
    latitude, // starting position
    zoom,
  },
};

type Viewport = typeof initialState.viewport;
export class Map extends React.Component<{}, State> {
  public state: State = initialState;

  async componentDidMount() {
    window.addEventListener("resize", this.resize);
    this.resize();
    const data = await getDataFromSheet();

    const safeData = data.filter(
      (report) =>
        report[
          "Optional: What is the OpenStreetMap node ID of the intersection? (exact crossing node preferable)"
        ]
    );

    const reports: TrafficLightReport[] = await Promise.all(
      safeData
        .filter(isValidTrafficLightReport)
        .map(convertToTrafficLightReport)
    );
    const intersections: IntersectionStats[] = summariseReportsByIntersection(reports); 
    console.log({ reports });
    this.setState({
      points: intersections,
      // Initially, show all points
      filteredPoints: intersections,
    });
  }

  async UNSAFE_componentWillUpdate(nextProps: any, nextState: State) {
    if (!nextState.map || !nextState.filteredPoints) {
      return;
    }
    // If we haven't drawn any markers before, draw them AND the map
    if (!this.state.markers && !nextState.markers) {
      console.log("Initial draw of map");
      const { map, filteredPoints } = nextState;
      addMapControls(map);
      const markers = drawIntersectionMarkers(map, filteredPoints);
      this.setState({
        markers,
      });
    }
    // If we HAVE drawn markers before, and the points are different, remove then draw them
    if (
      this.state.markers &&
      this.state.filteredPoints !== nextState.filteredPoints
    ) {
      console.log("Redrawing markers");
      const { map, filteredPoints } = nextState;
      removeMarkers(this.state.markers);
      const markers = drawIntersectionMarkers(map, filteredPoints);
      this.setState({
        markers,
      });
    }
  }

  public componentWillUnmount() {
    window.removeEventListener("resize", this.resize);
  }

  public async componentWillMount() {
  }
  public updateViewport = (viewport: Viewport) => {
    this.setState((prevState) => ({
      viewport: { ...prevState.viewport, ...viewport },
    }));
  };

  public resize = () => {
    this.setState((prevState) => ({
      viewport: {
        ...prevState.viewport,
        height: window.innerHeight,
        // width: window.innerWidth,
      },
    }));
  };

  private inputChange = (text: string) => {
    // private inputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // const text: string = e.target.value;

    if (!this.state.points) {
      return;
    }

    // const newFilteredPoints = this.state.points.filter((point) =>
    //   point.Title?.toLowerCase().includes(text.toLowerCase())
    // );

    // this.setState({
    //   // Initially, show all points
    //   filteredPoints: newFilteredPoints,
    // });
  };
  private buttonClick = (e: any) => {
    if (this.state.markers) {
      removeMarkers(this.state.markers);
    }
  };

  public render() {
    const { viewport } = this.state;
    return (
      <div id="container">
        <div id="search_overlay">
          <SearchInput onSearchTermUpdated={this.inputChange} />
        </div>
        <div id="map">
          <ReactMapGL
            width={"100%"}
            height={"100%"}
            className={"mapClass"}
            {...viewport}
            mapStyle={"mapbox://styles/mapbox/streets-v11"}
            ref={(ref) =>
              ref && !this.state.map && this.setState({ map: ref.getMap() })
            }
            mapboxApiAccessToken={MAPBOX_TOKEN}
            onViewportChange={(v: Viewport) => this.updateViewport(v)}
            attributionControl={false}
          >
            <div style={{ position: "absolute", right: 30, bottom: 30 }}>
              <NavigationControl onViewportChange={this.updateViewport} />
            </div>
          </ReactMapGL>
        </div>
      </div>
    );
  }
}
