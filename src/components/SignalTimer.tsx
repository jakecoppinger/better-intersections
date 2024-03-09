import { useState, useEffect, useMemo, MouseEventHandler, FC } from "react";
import styled from "@emotion/styled";

export interface SignalTimerCallback {
  /** Number of seconds pedestrian traffic light is green for */
  green: number;
  /** Number of seconds pedestrian traffic light is flashing red (or orange countdown) for */
  flashing: number;
  /** Number of seconds pedestrian traffic light is sold red for */
  red: number;
}

export interface SignalTimerProps {
  callback: (vals: SignalTimerCallback) => void;
  pressCount: number;
  setPressCount: (vals: number) => void;
  greenStartTime: number | null;
  setGreenStartTime: (vals: number) => void;
  flashingRedStartTime: number | null;
  setFlashingRedStartTime: (vals: number) => void;
  solidRedStartTime: number | null;
  setSolidRedStartTime: (vals: number) => void;
  nextCycleStartTime: number | null;
  setNextCycleStartTime: (vals: number) => void;
}

type SignalStateOptions =
  | "before-cycle"
  | "green"
  | "flashingRed"
  | "solidRed"
  | "next-cycle";

interface TrafficSignalProps {
  signalState: SignalStateOptions;
  onclick: MouseEventHandler<any>;
}

export const TrafficSignal: FC<TrafficSignalProps> = ({
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

function formatMillis(millis: number): string {
  const seconds = millis / 1000;
  // Only show 1 decimal place
  return Math.round(seconds * 10) / 10 + "s";
}
export const TimeDisplay: FC<TimeDisplayProps> = ({
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
      {greenStartTime !== null && (
        <span>
          Green for {formatMillis((flashingRedStartTime || now) - greenStartTime)}
        </span>
      )}
      {flashingRedStartTime !== null && (
        <span>
          , flashing red for{" "}
          {formatMillis((solidRedStartTime || now) - flashingRedStartTime)}
        </span>
      )}
      {solidRedStartTime !== null && (
        <span>
          , solid red for{" "}
          {formatMillis((nextCycleStartTime || now) - solidRedStartTime)}
        </span>
      )}
      {nextCycleStartTime !== null && greenStartTime && (
        <span>
          . Total cycle time {formatMillis(nextCycleStartTime - greenStartTime)}.
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

export const SignalTimer: FC<SignalTimerProps> = ({
  callback,
  pressCount,
  setPressCount,
  greenStartTime,
  setGreenStartTime,
  flashingRedStartTime,
  setFlashingRedStartTime,
  solidRedStartTime,
  setSolidRedStartTime,
  nextCycleStartTime,
  setNextCycleStartTime,
}: SignalTimerProps) => {

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
  }, [pressCount,
    setGreenStartTime,
    setFlashingRedStartTime,
    setSolidRedStartTime,
    setNextCycleStartTime]);

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
        // We could throw an error here, but if the props are set back to null in the incorrect order
        // this could occur - in this case, we just want to return
        return;
      }
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
      "Tap here when green walk light starts",
      "Tap when light flashes red (or counts in orange)",
      "Tap when light becomes solid red",
      "Tap when light becomes green (again)",
      "Done timing.",
    ];
    if (pressCount >= textIndex.length) {
      return undefined;
    }
    return textIndex[pressCount];
  }

  const handleClick: MouseEventHandler<HTMLButtonElement> = (e): void => {
    e.preventDefault();
    if (pressCount < 4) {
      setPressCount(pressCount + 1);
    }
  };
  const signalState = generateCurrentSignalState(pressCount);

  return (
    <>
      <h3>Step 2: Time intersection</h3>
      <p>
        Depending on your location and time of day, you may never get a green light unless you
        press the metal button to request to cross the road.
        <br></br>
        <b>Press the metal button after the pedestrian walk light changes to solid red</b> so that you measure the
        minimum possible pedestrian wait duration.
      </p>
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
