import { useEffect, useState } from "react";
import {
  AttributionControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Map,
} from "react-map-gl/mapbox";
import { getOSMCrossings } from "./api";
import { mapboxToken } from "../../config";
import { OSMNode, RawOSMCrossing } from "../../types";
import { getSiteDetailsForNodeId, SiteDetails } from "./utils";

export interface RequestSignalOnMapProps {
  location: { latitude: number; longitude: number };
  /** callback function - with the selected signal node id */
  onComplete: ({ osmNodeId, latitude, longitude,
    signalSite }: {
      osmNodeId: number, latitude: number,
      longitude: number, signalSite: SiteDetails | undefined
    }) => void;
}

export const RequestSignalOnMap: React.FC<RequestSignalOnMapProps> = ({
  location,
  onComplete,
}) => {
  const [osmIntersections, setOSMIntersections] = useState<
    RawOSMCrossing[] | undefined
  >(undefined);
  const [overpassResponse, setOverpassResponse] = useState<any>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntersections = async () => {
      setLoading(true);
      const intersectionsOverpassResponse = await getOSMCrossings(
        { lat: location.latitude, lon: location.longitude },
        200
      );

      const osmCrossingNodes =
        intersectionsOverpassResponse.elements.filter((el: any) =>
          el.type === "node"
        ) as OSMNode[];
      console.log({ osmCrossingNodes });
      setOSMIntersections(osmCrossingNodes);
      setLoading(false);
    };
    fetchIntersections();
  }, [location]);

  return (
    <>
      <h2>Select intersection</h2>
      <p>
        Select an intersection to take a measurement. If there is no pin at
        your desired location you don't need to select a pin - but make sure to
        describe the location well in the textbox below.
      </p>
      {loading && <p>Finding nearby intersections...</p>}
      <Map
        initialViewState={{
          longitude: location.longitude,
          latitude: location.latitude,
          zoom: 18,
        }}
        mapboxAccessToken={mapboxToken}
        id={"react-map"}
        style={{ width: "90vw", height: "50vh" }}
        mapStyle="mapbox://styles/mapbox/streets-v9"
        attributionControl={false}
      >
        {osmIntersections !== undefined
          ? osmIntersections.map((intersection: RawOSMCrossing) => (
            <Marker
              key={intersection.id}
              latitude={intersection.lat}
              longitude={intersection.lon}
              onClick={async () => {
                const signalSite = await getSiteDetailsForNodeId({
                  trafficSignalOsmNodeId: intersection.id,
                  overpassResponse: overpassResponse,
                });
                onComplete({
                  osmNodeId: intersection.id,
                  latitude: intersection.lat,
                  longitude: intersection.lon,
                  signalSite,
                });
              }}
              color={"red"}
            />
          ))
          : null}

        <AttributionControl compact={false} />
        <FullscreenControl position="bottom-right" />
        <GeolocateControl position="bottom-right" />
      </Map>
    </>
  );
};
