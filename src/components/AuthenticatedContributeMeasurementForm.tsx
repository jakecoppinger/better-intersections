import { useEffect, useState } from "react";
import {
  AttributionControl,
  FullscreenControl,
  GeolocateControl,
  Marker,
  Map as ReactMapGL
} from "react-map-gl/dist/esm/exports-mapbox"
import { Session } from "@supabase/gotrue-js/src/lib/types";
import { supabase } from "../utils/supabase-client";

import {
  UnprotectedCrossing,
  CrossingLanternType,
  IntersectionForm,
  IsScrambleCrossing,
  IntersectionInsertionFields,
  IsTwoStageCrossing,
} from "../types";
import { FormTextInput, RadioButtonComponent } from "./form-components";
import { SignalTimer } from "./SignalTimer";
import { RawOSMCrossing, getOSMCrossings } from "../api/overpass";
import { attemptFindNodeLocation, isNodeValid } from "../api/osm"

const MAPBOX_TOKEN =
  "pk.eyJ1IjoiamFrZWMiLCJhIjoiY2tkaHplNGhjMDAyMDJybW4ybmRqbTBmMyJ9.AR_fnEuka8-cFb4Snp3upw";

export interface AuthenticatedFormProps {
  session: Session;
  nodeId: undefined | string
}

export const AuthenticatedForm: React.FC<AuthenticatedFormProps> = (props) => {
  const { session, nodeId } = props;
  const [isSuppliedNodeValid, setIsSuppliedNodeValid] = useState<boolean | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [pressCount, setPressCount] = useState<number>(0);

  const [greenStartTime, setGreenStartTime] = useState<number | null>(null);
  const [flashingRedStartTime, setFlashingRedStartTime] = useState<
    number | null
  >(null);
  const [solidRedStartTime, setSolidRedStartTime] = useState<number | null>(
    null
  );
  const [nextCycleStartTime, setNextCycleStartTime] = useState<number | null>(
    null
  );

  const [formState, setFormState] = useState<Partial<IntersectionForm>>({});

  type FormValidatorOutput =
    | { data: IntersectionForm; error: false; message?: undefined }
    | { data?: undefined; error: true; message: string };

  function validateFormState(): FormValidatorOutput {
    const raw = formState;
    const missingTimeMeasurementMessage = 'Missing time measurement. Please use the "time intersection" function above.'
    if (raw.green_light_duration === undefined) {
      return {
        error: true,
        message:
          missingTimeMeasurementMessage,
      };
    }
    if (
      raw.flashing_red_light_duration === undefined ||
      isNaN(raw.flashing_red_light_duration)
    ) {
      return {
        error: true,
        message:
          missingTimeMeasurementMessage,
      };
    }
    if (
      raw.solid_red_light_duration === undefined ||
      isNaN(raw.solid_red_light_duration)
    ) {
      return {
        error: true,
        message:
          missingTimeMeasurementMessage,
      };
    }
    if (
      raw.location_description === undefined ||
      isNaN(raw.solid_red_light_duration)
    ) {
      return {
        error: true,
        message: "Missing field - please add a detailed description of the crossing location",
      };
    }
    if (raw.crossing_lantern_type === undefined) {
      return {
        error: true,
        message: "Missing field - please add the crossing lantern type (unknown is an option)",
      };
    }
    if (raw.unprotected_crossing === undefined) {
      return {
        error: true,
        message: "Missing field - Please add if the crossing is unprotected",
      };
    }
    if (raw.is_scramble_crossing === undefined) {
      return {
        error: true,
        message: "Missing field - please add if the crossing is a scrable crossing.",
      };
    }
    if (raw.is_two_stage_crossing === undefined) {
      return {
        error: true,
        message: "Missing form field - please add if it's a two-stage crossing",
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

    const {lat,lon} = await attemptFindNodeLocation(data.osm_node_id);

    const update: IntersectionInsertionFields = {
      user_id: user.id,
      updated_at: new Date(),
      ...data,
      latitude: lat,
      longitude: lon
    };

    let { error } = await supabase.from("measurements").insert(update);

    if (error) {
      alert(error.message);
    } else {
      alert("Measurement submitted, thanks! 🙏");
      setFormState({});
      setPressCount(0);
      setGreenStartTime(null);
      setFlashingRedStartTime(null);
      setSolidRedStartTime(null);
      setNextCycleStartTime(null);
      setGeolocationStatus(null);
      setGeolocationAllowed(null);
      setOSMIntersections(undefined);
    }
    setIsSubmitting(false);
  };

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
    // Check if the node in the URL is valid.
    const checkIfNodeValid = async () => {
      if (nodeId !== "" && nodeId !== undefined) {
        const isValid = await isNodeValid(nodeId);
        setIsSuppliedNodeValid(isValid);
      }
    }
    if (isSuppliedNodeValid === true) {
      setFormState((prev) => ({
        ...prev,
        osm_node_id: Number(nodeId),
      }));
    } else if (isSuppliedNodeValid === false) {
      // This error isn't likely to occur
      alert(`Error: The OSM node ID (${nodeId}) for this intersection couldn't be found.
You'll need to manually find the intersection or provide a location description.`)
    } else {
      checkIfNodeValid();
    }

    const asyncFunc = async () => {
      if (geolocationAllowed && location?.latitude && location?.longitude) {
        setGeolocationStatus("Finding nearby intersections...");
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
  }, [geolocationAllowed, location, nodeId, isSuppliedNodeValid]);

  return (
    <>
      <form onSubmit={submitMeasurement} className="form-widget">
        <br></br>

        {isSuppliedNodeValid === true &&
          <strong><h3>Step 1: The node ID has been recorded. 🎉</h3></strong>
        }
        {isSuppliedNodeValid !== true &&
          <button
            onClick={async (e) => {
              e.preventDefault();
              setGeolocationStatus("Attempting to find location...");

              if ("permissions" in navigator) {
                try {
                  const permissionStatus = await navigator.permissions.query({
                    name: "geolocation",
                  });

                  if (permissionStatus.state === "denied") {
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
                setGeolocationStatus(
                  "Geolocation not possible - you may need to enable it in your browser settings. Make sure to describe the location well in the textbox below!");
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
                  setGeolocationStatus("Geolocation not possible - please .");
                  setGeolocationAllowed(false);
                },
                {
                  enableHighAccuracy: true,
                  timeout: 5000,
                  maximumAge: 0,
                }
              );
            }}
            autoFocus={true}
          >
            Step 1: Find intersections near me
          </button>
        }
        <p>
          {geolocationStatus}{" "}
          {geolocationStatus === "Recorded intersection ID." ? "🎉" : null}
        </p>

        {geolocationAllowed === true &&
          location &&
          geolocationStatus !== "Recorded intersection ID." && (
            <>
              <h2>Select intersection</h2>
              <p>
                Select an intersection to take a measurement. If there is no pin
                at your desired location you you don't need to select a pin -
                but make sure to describe the location well in the textbox
                below.
              </p>
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
                          latitude: intersection.lat,
                          longitude: intersection.lon
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
          pressCount={pressCount}
          setPressCount={setPressCount}
          greenStartTime={greenStartTime}
          setGreenStartTime={setGreenStartTime}
          flashingRedStartTime={flashingRedStartTime}
          setFlashingRedStartTime={setFlashingRedStartTime}
          solidRedStartTime={solidRedStartTime}
          setSolidRedStartTime={setSolidRedStartTime}
          nextCycleStartTime={nextCycleStartTime}
          setNextCycleStartTime={setNextCycleStartTime}
        />

        <FormTextInput
          title="Location"
          description="Describe the location. Include road you're crossing and the adjacent road, and specify which side of the road. Coordinates are also helpful!"
          placeholder="eg. Castlereagh St & Bathurst St. Crossing Castlereagh St on south side."
          value={formState.location_description || ""}
          textarea={true}
          setValue={(location_description) =>
            setFormState((prev) => ({
              ...prev,
              location_description: location_description,
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
              unprotected_crossing: unprotected_crossing,
            }));
          }}
        />

        <RadioButtonComponent<IsScrambleCrossing>
          title="Is it a scramble crossing?"
          description="A scramble crossing is when pedestrians can cross either street (or diagonally) at the same time."
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
              is_scramble_crossing: is_scramble_crossing,
            }));
          }}
        />

        <RadioButtonComponent<IsTwoStageCrossing>
          title="Is it a two-stage crossing?"
          description="A two-stage crossing is when pedestrian is unable to legally cross a 
          dual-carriageway road in one cycle of the light - they have the wait at an island in 
          the middle of the road."
          id="is_two_stage_crossing"
          selectedButton={formState.is_two_stage_crossing || undefined}
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
            ] as { value: IsTwoStageCrossing; label: string }[]
          }
          callback={(is_two_stage_crossing: IsTwoStageCrossing) => {
            setFormState((prev) => ({
              ...prev,
              is_two_stage_crossing: is_two_stage_crossing,
            }));
          }}
        />

        {!isSuppliedNodeValid &&

          <FormTextInput
            title="OpenStreetMap node ID"
            description="What is the OpenStreetMap node ID of the crossing? This will be pre-filled if you clicked on a pin on the map above, please leave it!"
            value={formState.osm_node_id?.toString() || ""}
            placeholder="Optional. Eg: 11221625370"
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
                    osm_node_id: osm_node_id,
                  }));
                }
              } catch (e) { }
            }}
            required={false}
          />
        }


        <FormTextInput
          title="Notes"
          description="Any other notes or observations? (possible improvements)"
          value={typeof formState.notes == "string" ? formState.notes : ''}
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
