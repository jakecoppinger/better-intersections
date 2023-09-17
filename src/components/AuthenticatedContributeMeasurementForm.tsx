import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "../utils/supabase-client";
import { IntersectionForm, SQLIntersection } from "../types";

export interface AuthenticatedFormProps {
  session: Session;
}

function FormTextInput({
  title,
  // id,
  description,
  value,
  setValue,
  required = false,
}: {
  title: string;
  // id: string;
  description: string;
  value: string | undefined;
  setValue: (value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <h2>{title}</h2>
      <p>{description}</p>
      <input
        // id={id}
        type="text"
        required={required}
        value={value || ""}
        onChange={(e) => setValue(e.target.value)}
      />
    </div>
  );
}
export const AuthenticatedForm: React.FC<AuthenticatedFormProps> = (props) => {
  const { session } = props;

  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any | undefined>();

  const [formState, setFormState] = useState<Partial<IntersectionForm>>({});
  type FormValidatorOutput =
    | { data: IntersectionForm; error: false; message?: undefined }
    | { data?: undefined; error: true; message: string };

  type CrossingLanternType =
    | "pedestrian"
    | "pedestrian_and_bicycle"
    | "bicycle";

  interface RadioButtonComponentProps {
    value: CrossingLanternType;
    callback: (val: CrossingLanternType) => void;
  }

  const RadioButtonComponent: React.FC<RadioButtonComponentProps> = ({
    value,
    callback,
  }: RadioButtonComponentProps) => {
    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newVal: CrossingLanternType = event.target
        .value as CrossingLanternType;
      callback(newVal);
    };

    return (
      <div>
        <h2>Crossing Lantern Type</h2>
        <p>What sort of crossing is this?</p>
        <label>
          <input
            type="radio"
            name="crossing_lantern_type"
            value="pedestrian"
            checked={formState.crossing_lantern_type === "pedestrian"}
            onChange={handleRadioChange}
          />
          Pedestrian
        </label>

        <label>
          <input
            type="radio"
            name="crossing_lantern_type"
            value="pedestrian_and_bicycle"
            checked={
              formState.crossing_lantern_type === "pedestrian_and_bicycle"
            }
            onChange={handleRadioChange}
          />
          Pedestrian and Bicycle
        </label>

        <label>
          <input
            type="radio"
            name="crossing_lantern_type"
            value="bicycle"
            checked={formState.crossing_lantern_type === "bicycle"}
            onChange={handleRadioChange}
          />
          Bicycle
        </label>
      </div>
    );
  };

  function validateFormState(): FormValidatorOutput {
    const raw = formState;
    if (raw.green_light_duration === undefined) {
      return {
        error: true,
        message: "Green light duration is required",
      };
    }
    if (raw.flashing_red_light_duration === undefined) {
      return {
        error: true,
        message: "Flashing red light duration is required",
      };
    }
    if (raw.solid_red_light_duration === undefined) {
      return {
        error: true,
        message: "Solid red light duration is required",
      };
    }
    if (raw.location_description === undefined) {
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
    if (raw.can_cars_cross_while_flashing_red === undefined) {
      return {
        error: true,
        message: "Can cars cross while flashing red is required",
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

  useEffect(() => {
    async function getMeasurements() {
      setLoading(true);
      // const { user } = session;

      const { data, error } = await supabase
        .from("measurements")
        .select(
          `id,updated_at,location_description,green_light_duration,flashing_red_light_duration,solid_red_light_duration,osm_node_id,crossing_lantern_type,can_cars_cross_while_flashing_red,intersection_id,is_scramble_crossing,notes`
        );
      // .eq("id", user.id)

      if (error) {
        console.warn(error);
      } else if (data) {
        setData(data);
      }

      setLoading(false);
    }

    getMeasurements();
  }, [session]);

  const submitMeasurement: any = async (event: any, avatarUrl: any) => {
    event.preventDefault();
    console.log({ event });

    setLoading(true);
    const { user } = session;
    // TODO

    const { data, error: validateError, message } = validateFormState();
    if (validateError || data === undefined) {
      alert(message);
      setLoading(false);
      return;
    }
    const update: SQLIntersection = {
      id: user.id,
      updated_at: new Date(),
      ...data,
    };

    let { error } = await supabase.from("measurements").insert(update);

    if (error) {
      alert(error.message);
    } else {
      console.log("success");
    }
    setLoading(false);
  };

  return (
    <>
      <p>Measurements: {JSON.stringify(data)}</p>

      <form onSubmit={submitMeasurement} className="form-widget">
        <div>
          <h2>Location</h2>
          <p>
            Describe the location (road you're crossing & nearest feature,
            adjacent road if traffic lights, or coordinates)
          </p>
          <input
            id="location"
            type="text"
            required
            value={formState.location_description || ""}
            onChange={(e) =>
              setFormState((prev) => ({
                ...prev,
                location_description: e.target.value,
              }))
            }
          />
        </div>

        <FormTextInput
          title="Green light duration"
          description="How many seconds was the pedestrian light green for?"
          value={formState.green_light_duration?.toString()}
          setValue={(newVal: string) => {
            try {
              const green_light_duration = parseFloat(newVal);
              return setFormState((prev) => ({
                ...prev,
                green_light_duration,
              }));
            } catch (e) {}
          }}
          required={true}
        />
        <FormTextInput
          title="Flashing red light duration"
          description="How many seconds was the pedestrian light flashing red for?"
          value={formState.flashing_red_light_duration?.toString()}
          setValue={(newVal: string) => {
            try {
              const flashing_red_light_duration = parseFloat(newVal);
              return setFormState((prev) => ({
                ...prev,
                flashing_red_light_duration,
              }));
            } catch (e) {}
          }}
          required={true}
        />
        <FormTextInput
          title="Solid red light duration"
          description="How many seconds was the pedestrian light solid red for?"
          value={formState.solid_red_light_duration?.toString()}
          setValue={(newVal: string) => {
            try {
              const solid_red_light_duration = parseFloat(newVal);
              return setFormState((prev) => ({
                ...prev,
                solid_red_light_duration,
              }));
            } catch (e) {}
          }}
          required={true}
        />
        <RadioButtonComponent
          value={formState.crossing_lantern_type || "pedestrian"}
          callback={(val: CrossingLanternType) => {
            setFormState((prev) => ({
              ...prev,
              crossing_lantern_type: val,
            }));
          }}
        />

        <button
          className="button block primary"
          type="submit"
          disabled={loading}
        >
          {loading ? "Loading ..." : "Submit"}
        </button>
      </form>
    </>
  );
};
