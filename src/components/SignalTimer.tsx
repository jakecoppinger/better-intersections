import React, { useState, useEffect } from "react";
import styled from "@emotion/styled";
import { css, SerializedStyles, keyframes } from "@emotion/react";

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

export interface SignalTimerCallback {
  green: number;
  flashing: number;
  red: number;
}

export interface SignalTimerProps<T> {
  callback: (vals: SignalTimerCallback) => void;
}
export function SignalTimer<T extends string>({
  callback,
}: SignalTimerProps<T>) {
  return <h1>Hello</h1>;
}

interface TimerState {
  greenTime: number;
  flashingRedTime: number;
  solidRedTime: number;
}
type SignalStateOptions = "before-cycle"
    | "green"
    | "flashingRed"
    | "solidRed"
    | "next-cycle";

interface TrafficSignalProps {
  signalState:SignalStateOptions;
}

export const TrafficSignal: React.FC<TrafficSignalProps> = ({
  signalState,
}: TrafficSignalProps) => {
  const getSignalCSS = () => {
    const pulse = keyframes`
    0% {
      background-color: red;
    }
    100% {
      background-color: white;
    }
  `;

    if (signalState === "before-cycle") {
      return css({ backgroundColor: "grey" });
    }
    if (signalState === "green") {
      return css({ backgroundColor: "green" });
    }
    if (signalState === "flashingRed") {
      return css({
        backgroundColor: "red",
        transition: "0.2s",
        animation: `${pulse} 1s infinite alternate`,
      });
    }
    if (signalState === "solidRed") {
      return css({ backgroundColor: "red" });
    }
    if (signalState === "next-cycle") {
      return css({ backgroundColor: "grey" });
    }
    return undefined;
  };
  const SignalLamp = styled.div`
    width: 100px;
    height: 100px;
    border-radius: 50%;
    ${getSignalCSS()}
  `;

  return <SignalLamp />;
};

export const CountingButton: React.FC = () => {
  const [pressCount, setPressCount] = useState<number>(0);
  const generateSignalState = (): SignalStateOptions => {
      const stateLookup: SignalStateOptions[] = [
      "before-cycle",
      "green",
      "flashingRed",
      "solidRed"
    ]
    return stateLookup[pressCount] || 'next-cycle';
  };

  // All in milliseconds
  const [greenStartTime, setGreenStartTime] = useState<number | null>(null);
  const [flashingRedStartTime, setFlashingRedStartTime] = useState<
    number | null
  >(null);
  const [solidRedStartTime, setSolidRedStartTime] = useState<number | null>(
    null
  );

  const [startTime, setStartTime] = useState<number | null>(null);
  const [timerState, setTimerState] = useState<TimerState>({
    greenTime: 0,
    flashingRedTime: 0,
    solidRedTime: 0,
  });

  useEffect(() => {
    if (pressCount === 1) {
      setGreenStartTime(Date.now());
    } else if (pressCount === 2) {
      setFlashingRedStartTime(Date.now());
    } else if (pressCount === 3) {
      setSolidRedStartTime(Date.now());
    }
  }, [pressCount]);

  function generateButtonText() {
    const textIndex = [
      "Press button when green light starts",
      "Press when light flashes red or counts in orange",
      "Press when light becomes solid red",
      "Press when light becomes green (again)",
    ]
    if(pressCount >= textIndex.length) {
      return undefined;
    }
    return textIndex[pressCount];
  }

  const handleClick = (): void => {
    if (pressCount < 4) {
      setPressCount(pressCount + 1);
    } else {
      setPressCount(0);
    }
  };

  const signalState = generateSignalState();

  return (
    <>
      <TrafficSignal signalState={signalState} />

      <button onClick={handleClick}>{generateButtonText()}</button>
    </>
  );
};
