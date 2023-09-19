import React from "react";
import styled from "@emotion/styled";

const PaddedLabel = styled.label`
  margin-left: 5px;
`;

const RadioButtonContainer = styled.div`
  display: block;
  margin-top: 5px;
`;
const FormSectionTitle = styled.h2`
  margin-top: 0px;
  margin-bottom: 5px;
`;
const FormSectionDescription = styled.p`
  margin-top: 0px;
  margin-bottom: 10px;
`;

const FormSectionWrapper = styled.div`
  margin-top: 20px;
  margin-bottom: 20px;
`;

export function FormTextInput({
  title,
  description,
  value,
  setValue,
  required = false,
}: {
  title: string;
  description: string;
  value?: string | undefined;
  setValue: (value: string) => void;
  required?: boolean;
}) {
  return (
    <FormSectionWrapper>
      <FormSectionTitle>
        {(!required ? "Optional: " : " ") + title}
      </FormSectionTitle>
      <FormSectionDescription>{description}</FormSectionDescription>
      <input
        type="text"
        required={required}
        value={value}
        onChange={(e) => {
          setValue(e.target.value);
        }}
      />
    </FormSectionWrapper>
  );
}

export interface RadioButtonComponentProps<T> {
  selectedButton: T | undefined;
  callback: (val: T) => void;
  options: { value: T; label: string }[];
  id: string;
  title: string;
  description: string;
}
export function RadioButtonComponent<T extends string>({
  selectedButton,
  callback,
  options,
  id,
  title,
  description,
}: RadioButtonComponentProps<T>) {
  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal: T = event.target.value as T;
    callback(newVal);
  };

  return (
    <FormSectionWrapper>
      <FormSectionTitle>{title}</FormSectionTitle>
      <FormSectionDescription>{description}</FormSectionDescription>
      {options.map((option) => (
        <RadioButtonContainer key={option.value}>
          <input
            type="radio"
            value={option.value}
            id={`${id}${option.value}`}
            checked={selectedButton === option.value}
            onChange={handleRadioChange}
          />
          <PaddedLabel htmlFor={`${id}${option.value}`}>
            {option.label}
          </PaddedLabel>
        </RadioButtonContainer>
      ))}
    </FormSectionWrapper>
  );
}
