import { useEffect, useRef, useState } from "react";
import { Logger } from "../Settings/Logs/Logs";

export const useUserMedia = (
  getStream: (constraints: MediaTrackConstraints) => Promise<MediaStream>,
  initialConstraints: MediaTrackConstraints
) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const constraintsRef = useRef<MediaTrackConstraints>(initialConstraints);

  const track = stream?.getTracks()[0];

  const stop = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const start = async () => {
    try {
      Logger.log("getting stream with constraints");
      Logger.log(constraintsRef.current);

      const newStream = await getStream(constraintsRef.current);
      setStream(newStream);
    } catch (e: any) {
      Logger.error("Error while creating stream:");
      Logger.error(e);
    }
  };

  const toggle = async () => {
    if (stream) {
      stop();
    } else {
      await start();
    }
  };

  const mergeConstraints = async (newConstraints: MediaTrackConstraints) => {
    Logger.log("merging constraints with");
    Logger.log(newConstraints);

    constraintsRef.current = {
      ...constraintsRef.current,
      ...newConstraints,
    };

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      await start();
    }
  };

  const configuredConstraints = track?.getConstraints();
  const actualConstraints = track?.getSettings();

  useEffect(() => {
    if (stream) {
      return () => {
        stream.getTracks().forEach((track) => track.stop());
      };
    }
  }, [stream]);

  return {
    stream,
    track,
    toggle,
    mergeConstraints,
    configuredConstraints,
    actualConstraints,
  };
};

// export type GenericStream<T = any> = {
//   stream: MediaStream | null;
//   toggle: () => Promise<void>;
//   mergeConstraints: (newConstraints: T) => void;
//   setConstraints: (newConstraints: T) => void;
//   videoConstraints?: MediaTrackConstraints;
//   audioConstraints?: MediaTrackConstraints;
//   videoSettings?: MediaTrackSettings;
//   audioSettings?: MediaTrackSettings;
// };
