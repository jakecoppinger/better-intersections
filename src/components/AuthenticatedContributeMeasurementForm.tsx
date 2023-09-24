import React, { useEffect, useState } from "react";
import ReactMapGL, {
  MapboxMap,
  AttributionControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Popup,
  ViewStateChangeEvent,
} from "react-map-gl";
import { Session } from "@supabase/supabase-js";

import { supabase } from "../utils/supabase-client";

import {
  UnprotectedCrossing,
  CrossingLanternType,
  IntersectionForm,
  IsScrambleCrossing,
  SQLIntersection,
} from "../types";
import { FormTextInput, RadioButtonComponent } from "./form-components";
import { SignalTimer } from "./SignalTimer";
import { RawOSMCrossing, getOSMCrossings } from "../api/overpass";
const MAPBOX_TOKEN =
  "pk.eyJ1IjoiamFrZWMiLCJhIjoiY2tkaHplNGhjMDAyMDJybW4ybmRqbTBmMyJ9.AR_fnEuka8-cFb4Snp3upw";

export interface AuthenticatedFormProps {
  session: Session;
}

export const AuthenticatedForm: React.FC<AuthenticatedFormProps> = (props) => {
  const { session } = props;

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formState, setFormState] = useState<Partial<IntersectionForm>>({});
  type FormValidatorOutput =
    | { data: IntersectionForm; error: false; message?: undefined }
    | { data?: undefined; error: true; message: string };

  function validateFormState(): FormValidatorOutput {
    const raw = formState;
    if (raw.green_light_duration === undefined) {
      debugger;
      return {
        error: true,
        message:
          "Please input a valid green light duration in seconds (without letters)",
      };
    }
    if (
      raw.flashing_red_light_duration === undefined ||
      isNaN(raw.flashing_red_light_duration)
    ) {
      return {
        error: true,
        message:
          "Please input a valid flashing red light duration in seconds (without letters)",
      };
    }
    console.log({ solid_red_light_duration: raw.solid_red_light_duration });
    if (
      raw.solid_red_light_duration === undefined ||
      isNaN(raw.solid_red_light_duration)
    ) {
      return {
        error: true,
        message:
          "Please input a valid red light duration in seconds (without letters)",
      };
    }
    if (
      raw.location_description === undefined ||
      isNaN(raw.solid_red_light_duration)
    ) {
      return {
        error: true,
        message: "Location description is required",
      };
    }
    if (raw.crossing_lantern_type === undefined) {
      return {
        error: true,
        message: "Crossing lantern type is required",
      };
    }
    if (raw.unprotected_crossing === undefined) {
      return {
        error: true,
        message: "Missing info if it's a protected crossing",
      };
    }
    if (raw.is_scramble_crossing === undefined) {
      return {
        error: true,
        message: "Is scramble crossing is required",
      };
    }

    return { data: raw as IntersectionForm, error: false };
  }

  const submitMeasurement: any = async (event: any, avatarUrl: any) => {
    event.preventDefault();

    setIsSubmitting(true);
    const { user } = session;

    const { data, error: validateError, message } = validateFormState();
    if (validateError || data === undefined) {
      alert(message);
      setIsSubmitting(false);
      return;
    }
    const update: SQLIntersection = {
      user_id: user.id,
      updated_at: new Date(),
      ...data,
    };

    let { error } = await supabase.from("measurements").insert(update);

    if (error) {
      alert(error.message);
    } else {
      alert("Measurement submitted, thanks! 🙏");
    }
    setFormState({});
    setIsSubmitting(false);
  };

  // const latitude = -33.8688;
  // const longitude = 151.1593;
  // const zoom: number = 11;

  const [location, setLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [geolocationAllowed, setGeolocationAllowed] = useState<boolean | null>(
    null
  );
  const [geolocationStatus, setGeolocationStatus] = useState<string | null>();
  const [osmIntersections, setOSMIntersections] = useState<any[] | undefined>(
    undefined
  );

  useEffect(() => {
    const asyncFunc = async () => {
      if (geolocationAllowed && location?.latitude && location?.longitude) {
        setGeolocationStatus("Fetching intersections...");
        const osmIntersections = await getOSMCrossings(
          { lat: location?.latitude, lon: location?.longitude },
          200
        );

        setOSMIntersections(osmIntersections);
        setGeolocationStatus("Found intersections.");
        console.log({ osmIntersections });
      }
    };

    asyncFunc();
  }, [geolocationAllowed, location]);

  return (
    <>
      <form onSubmit={submitMeasurement} className="form-widget">
        <br></br>
        <button
          onClick={async (e) => {
            e.preventDefault();
            setGeolocationStatus("Attempting to find location...");

            if ('permissions' in navigator) {
              try {
                const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

                if (permissionStatus.state === 'denied') {
                  setGeolocationStatus("Geolocation permission denied.");
                  setGeolocationAllowed(false);
                  return;
                }

              } catch (err) {
                alert((err as any).toString());
                console.error("Error checking permissions:", err);
              }
            }

            if (!navigator.geolocation) {
              setGeolocationAllowed(false);
              setGeolocationStatus("Geolocation not possible.");
              return;
            }

            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                setLocation({ latitude, longitude });
                setGeolocationAllowed(true);
                setGeolocationStatus("Found location.");
              },
              (err) => {
                setGeolocationStatus("Geolocation not possible.");
                setGeolocationAllowed(false);
              }
              ,{
                enableHighAccuracy: true,
                timeout: 5000,
                maximumAge: 0
            }
            );
          }}
          autoFocus={true}
        >
          Find intersections near me
        </button>
        <p>
          {geolocationStatus}{" "}
          {geolocationStatus === "Recorded intersection ID." ? "🎉" : null}
        </p>

        {geolocationAllowed === true &&
          location &&
          geolocationStatus !== "Recorded intersection ID." && (
            <>
              <h2>Select the intersection</h2>
              <ReactMapGL
                initialViewState={{
                  longitude: location.longitude,
                  latitude: location.latitude,
                  zoom: 18,
                }}
                mapboxAccessToken={MAPBOX_TOKEN}
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
                          setFormState((prev) => ({
                            ...prev,
                            osm_node_id: intersection.id,
                          }));
                          setGeolocationStatus("Recorded intersection ID.");
                        }}
                        color={"red"}
                      />
                    ))
                  : null}

                <AttributionControl compact={false} />
                <FullscreenControl position="bottom-right" />
                <GeolocateControl position="bottom-right" />
              </ReactMapGL>
            </>
          )}

        <SignalTimer
          callback={(times) => {
            setFormState((prev) => ({
              ...prev,
              green_light_duration: times.green,
              flashing_red_light_duration: times.flashing,
              solid_red_light_duration: times.red,
            }));
          }}
        />

        <FormTextInput
          title="Location"
          description="Describe the location (road you're crossing & nearest feature, adjacent road if traffic lights, or coordinates)"
          value={formState.location_description || ""}
          setValue={(location_description) =>
            setFormState((prev) => ({
              ...prev,
              location_description,
            }))
          }
          required={true}
        />

        <RadioButtonComponent<CrossingLanternType>
          title="Crossing Lantern Type"
          description="What sort of crossing is this?"
          id="crossing_lantern_type"
          selectedButton={formState.crossing_lantern_type}
          options={
            [
              {
                value: "pedestrian",
                label: "Pedestrian",
              },
              {
                value: "pedestrian_and_bicycle",
                label: "Pedestrian and Bicycle",
              },
              {
                value: "bicycle",
                label: "Bicycle",
              },
            ] as { value: CrossingLanternType; label: string }[]
          }
          callback={(val: CrossingLanternType) => {
            setFormState((prev) => ({
              ...prev,
              crossing_lantern_type: val,
            }));
          }}
        />

        <RadioButtonComponent<UnprotectedCrossing>
          title="Is crossing unprotected?"
          description="Can cars cross when the light is flashing red?"
          id="unprotected_crossing"
          selectedButton={formState.unprotected_crossing}
          options={
            [
              {
                value: "yes",
                label: "Yes",
              },
              {
                value: "no",
                label: "No",
              },
              {
                value: "unknown",
                label: "Unknown",
              },
            ] as { value: UnprotectedCrossing; label: string }[]
          }
          callback={(unprotected_crossing: UnprotectedCrossing) => {
            setFormState((prev) => ({
              ...prev,
              unprotected_crossing,
            }));
          }}
        />

        <RadioButtonComponent<IsScrambleCrossing>
          title="Is it a scramble crossing?"
          description="A scramble crossing is when all pedestrians on each side cross at the same time."
          id="is_scramble_crossing"
          selectedButton={formState.is_scramble_crossing || undefined}
          options={
            [
              {
                value: "yes",
                label: "Yes",
              },
              {
                value: "no",
                label: "No",
              },
              {
                value: "unknown",
                label: "Unknown",
              },
            ] as { value: IsScrambleCrossing; label: string }[]
          }
          callback={(is_scramble_crossing: IsScrambleCrossing) => {
            setFormState((prev) => ({
              ...prev,
              is_scramble_crossing,
            }));
          }}
        />

        <FormTextInput
          title="OpenStreetMap node ID"
          description="What is the OpenStreetMap node ID of the intersection? (exact crossing node preferable)"
          value={formState.osm_node_id?.toString() || ""}
          setValue={(newVal: string) => {
            try {
              if (newVal === "") {
                return setFormState((prev) => ({
                  ...prev,
                  osm_node_id: undefined,
                }));
              }
              const osm_node_id = parseInt(newVal);
              if (!isNaN(osm_node_id)) {
                return setFormState((prev) => ({
                  ...prev,
                  osm_node_id,
                }));
              }
            } catch (e) {}
          }}
          required={false}
        />

        <FormTextInput
          title="Notes"
          description="Any other notes or observations? (possible improvements)"
          setValue={(val) =>
            setFormState((prev) => ({
              ...prev,
              notes: val,
            }))
          }
          textarea={true}
          required={false}
        />

        <br></br>
        {/* <p>Debug: formState: {JSON.stringify(formState)}</p> */}

        <button
          className="button block primary"
          type="submit"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Loading ..." : "Submit"}
        </button>
      </form>
    </>
  );
};
