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
import { RawOSMCrossing } from "../../types";

export interface RequestSignalOnMapProps {
  location: { latitude: number; longitude: number };
  onComplete: (osmNodeId: number, latitude: number, longitude: number) => void;
}

export const RequestSignalOnMap: React.FC<RequestSignalOnMapProps> = ({
  location,
  onComplete,
}) => {
  const [osmIntersections, setOSMIntersections] = useState<
    RawOSMCrossing[] | undefined
  >(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchIntersections = async () => {
      setLoading(true);
      const intersections = await getOSMCrossings(
        { lat: location.latitude, lon: location.longitude },
        200
      );
      setOSMIntersections(intersections);
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
                onClick={() => {
                  onComplete(
                    intersection.id,
                    intersection.lat,
                    intersection.lon
                  );
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
