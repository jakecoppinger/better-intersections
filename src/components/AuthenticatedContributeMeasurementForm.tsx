import React, { useState } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "../utils/supabase-client";

import {
  ProtectedCrossing,
  CrossingLanternType,
  IntersectionForm,
  IsScrambleCrossing,
  SQLIntersection,
} from "../types";
import { FormTextInput, RadioButtonComponent } from "./form-components";
import { SignalTimer } from "./SignalTimer";

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
    if (raw.protected_crossing === undefined) {
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

  return (
    <>
      <form onSubmit={submitMeasurement} className="form-widget">
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

        <RadioButtonComponent<ProtectedCrossing>
          title="Is crossing protected?"
          description="Can cars cross when light is flashing red?"
          id="protected_crossing"
          selectedButton={formState.protected_crossing}
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
            ] as { value: ProtectedCrossing; label: string }[]
          }
          callback={(protected_crossing: ProtectedCrossing) => {
            setFormState((prev) => ({
              ...prev,
              protected_crossing,
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
          setValue={(newVal: string) => {
            try {
              const osm_node_id = parseInt(newVal);
              return setFormState((prev) => ({
                ...prev,
                osm_node_id,
              }));
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
