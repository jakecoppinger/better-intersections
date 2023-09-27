import React, { useState, useEffect, useMemo } from "react";
import styled from "@emotion/styled";
import { css, keyframes } from "@emotion/react";

export interface SignalTimerCallback {
  green: number;
  flashing: number;
  red: number;
}

export interface SignalTimerProps {
  callback: (vals: SignalTimerCallback) => void;
}

type SignalStateOptions =
  | "before-cycle"
  | "green"
  | "flashingRed"
  | "solidRed"
  | "next-cycle";

interface TrafficSignalProps {
  signalState: SignalStateOptions;
  onclick: React.MouseEventHandler<any>;
}

export const TrafficSignal: React.FC<TrafficSignalProps> = ({
  signalState,
  onclick,
}: TrafficSignalProps) => {
  const getSignalImage = () => {
    if (signalState === "before-cycle") {
      return (
        <img
          src="/img/red-dont-walk.png"
          width="100px"
          height="100px"
          style={{ opacity: 0.5, filter: "saturate(0)" }}
          alt="Before cycle"
        />
      );
    }
    if (signalState === "green") {
      return (
        <img
          src="/img/green-walk.png"
          width="100px"
          height="100px"
          alt="Green"
        />
      );
    }
    if (signalState === "flashingRed") {
      return (
        <img
          src="/img/red-dont-walk.png"
          width="100px"
          height="100px"
          style={{
            animation: `fadeOpacity 1s infinite alternate`,
          }}
          alt="Flashing red"
        />
      );
    }
    if (signalState === "solidRed") {
      return (
        <img
          src="/img/red-dont-walk.png"
          width="100px"
          height="100px"
          alt="Solid red"
        />
      );
    }
    if (signalState === "next-cycle") {
      return (
        <img
          src="/img/red-dont-walk.png"
          width="100px"
          height="100px"
          style={{ opacity: 0.5, filter: "saturate(0)" }}
          alt="Next cycle"
        />
      );
    }
    return undefined;
  };
  const TrafficLightContainer = styled.div`
    width: 100px;
    height: 100px;
    background-color: black;
  `;
  return (
    <TrafficLightContainer onClick={onclick}>
      {getSignalImage()};
    </TrafficLightContainer>
  );
};

interface TimeDisplayProps {
  greenStartTime: number | null;
  flashingRedStartTime: number | null;
  solidRedStartTime: number | null;
  nextCycleStartTime: number | null;
}
export const TimeDisplay: React.FC<TimeDisplayProps> = ({
  greenStartTime,
  flashingRedStartTime,
  solidRedStartTime,
  nextCycleStartTime,
}: TimeDisplayProps) => {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    // Set an interval to update currentDate every 100ms
    const interval = setInterval(() => {
      setNow(Date.now());
    }, 100);

    // Clear interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  return (
    <p>
      {/* {greenStartTime === null && <span>Ready</span>} */}
      {greenStartTime !== null && (
        <span>
          Green for {((flashingRedStartTime || now) - greenStartTime) / 1000}s
        </span>
      )}
      {flashingRedStartTime !== null && (
        <span>
          , flashing red for{" "}
          {((solidRedStartTime || now) - flashingRedStartTime) / 1000}s
        </span>
      )}
      {solidRedStartTime !== null && (
        <span>
          , solid red for{" "}
          {((nextCycleStartTime || now) - solidRedStartTime) / 1000}s
        </span>
      )}
      {nextCycleStartTime !== null && greenStartTime && (
        <span>
          . Total cycle time {(nextCycleStartTime - greenStartTime) / 1000}s.
        </span>
      )}
    </p>
  );
};
const generateCurrentSignalState = (
  newPressCount: number
): SignalStateOptions => {
  const stateLookup: SignalStateOptions[] = [
    "before-cycle",
    "green",
    "flashingRed",
    "solidRed",
  ];
  return stateLookup[newPressCount] || "next-cycle";
};

export const SignalTimer: React.FC<SignalTimerProps> = ({
  callback,
}: SignalTimerProps) => {
  /** The number of times the button has been pressed. If 0 times, light is grey. If 1, green.
   * If 2, flashing red. If 3, solid red. If 4, grey. */
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

  useEffect(() => {
    if (pressCount === 1) {
      setGreenStartTime(Date.now());
    } else if (pressCount === 2) {
      setFlashingRedStartTime(Date.now());
    } else if (pressCount === 3) {
      setSolidRedStartTime(Date.now());
    } else if (pressCount === 4) {
      setNextCycleStartTime(Date.now());
    }
  }, [pressCount]);

  const memoisedCallback = useMemo(() => callback, []);
  useEffect(() => {
    if (nextCycleStartTime !== null) {
      // We're done!
      if (
        flashingRedStartTime === null ||
        greenStartTime === null ||
        solidRedStartTime === null ||
        nextCycleStartTime === null
      ) {
        throw new Error("Start times not set");
      }
      console.log("calling callback");
      memoisedCallback({
        green: (flashingRedStartTime - greenStartTime) / 1000,
        flashing: (solidRedStartTime - flashingRedStartTime) / 1000,
        red: (nextCycleStartTime - solidRedStartTime) / 1000,
      });
    }
  }, [
    memoisedCallback,
    nextCycleStartTime,
    flashingRedStartTime,
    greenStartTime,
    solidRedStartTime,
  ]);

  function generateButtonText() {
    const textIndex = [
      "Press button when green light starts",
      "Press when light flashes red or counts in orange",
      "Press when light becomes solid red",
      "Press when light becomes green (again)",
      "Done timing.",
    ];
    if (pressCount >= textIndex.length) {
      return undefined;
    }
    return textIndex[pressCount];
  }

  const handleClick: React.MouseEventHandler<HTMLButtonElement> = (e): void => {
    e.preventDefault();
    if (pressCount < 4) {
      setPressCount(pressCount + 1);
    }
  };
  const signalState = generateCurrentSignalState(pressCount);

  return (
    <>
    <h3>Step 2: Time intersection</h3>
      <TrafficSignal onclick={handleClick} signalState={signalState} />
      <button
        autoFocus={true}
        disabled={signalState === "next-cycle"}
        onClick={handleClick}
      >
        {generateButtonText()}
      </button>
      <TimeDisplay
        greenStartTime={greenStartTime}
        flashingRedStartTime={flashingRedStartTime}
        solidRedStartTime={solidRedStartTime}
        nextCycleStartTime={nextCycleStartTime}
      />
    </>
  );
};
