import React, { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";

import { supabase } from "../utils/supabase-client";
import {
  CanCarsCrossWhileFlashingRed,
  CrossingLanternType,
  IntersectionForm,
  IsScrambleCrossing,
  SQLIntersection,
} from "../types";

interface CheckboxProps {
  checkboxLabel: string;
  initialValue: boolean;
  onToggle: (value: boolean) => void;
}

const CheckboxWithLabel: React.FC<CheckboxProps> = ({
  initialValue,
  onToggle,
  checkboxLabel,
}) => {
  const [checked, setChecked] = useState(initialValue);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const updatedValue = e.target.checked;
    setChecked(updatedValue);
    onToggle(updatedValue);
  };

  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={checked}
          onChange={handleCheckboxChange}
        />
        {checkboxLabel}
      </label>
    </div>
  );
};

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

  interface RadioButtonComponentProps<T> {
    selectedButton: T | undefined;
    callback: (val: T) => void;
    options: { value: T; label: string }[];
  }

  function RadioButtonComponent<T extends string>({
    selectedButton,
    callback,
    options,
  }: RadioButtonComponentProps<T>) {
    const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      const newVal: T = event.target.value as T;
      callback(newVal);
    };

    return (
      <div>
        {options.map((option) => (
          <label key={option.value}>
            <input
              type="radio"
              value={option.value}
              checked={selectedButton === option.value}
              onChange={handleRadioChange}
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

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

  const submitMeasurement: any = async (event: any, avatarUrl: any) => {
    event.preventDefault();
    console.log({ event });

    setLoading(true);
    const { user } = session;

    const { data, error: validateError, message } = validateFormState();
    if (validateError || data === undefined) {
      alert(message);
      setLoading(false);
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

        <h2>Crossing Lantern Type</h2>
        <p>What sort of crossing is this?</p>

        <RadioButtonComponent<CrossingLanternType>
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

        <h2>Is crossing protected?</h2>
        <p>Can cars cross when light is flashing red?</p>

        <RadioButtonComponent<CanCarsCrossWhileFlashingRed>
          selectedButton={formState.can_cars_cross_while_flashing_red}
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
            ] as { value: CanCarsCrossWhileFlashingRed; label: string }[]
          }
          callback={(
            can_cars_cross_while_flashing_red: CanCarsCrossWhileFlashingRed
          ) => {
            setFormState((prev) => ({
              ...prev,
              can_cars_cross_while_flashing_red,
            }));
          }}
        />
        <h2>Is it a scamble crossing?</h2>
        <p>
          A scramble crossing is when all pedestrians on each side cross at the
          same time.
        </p>

        <RadioButtonComponent<IsScrambleCrossing>
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
