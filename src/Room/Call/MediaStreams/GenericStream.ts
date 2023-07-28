import { useEffect, useState } from "react";

export const useGenericTrack = <T extends MediaStreamConstraints>(
  getStream: (constraints: T) => Promise<MediaStream>,
  initialConstraints: T
) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [constraints, setConstraints] = useState<T>(initialConstraints);

  const stop = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const start = async () => {
    if (!stream) {
      try {
        const newStream = await getStream(constraints);
        setStream(newStream);
      } catch (e) {
        console.error("Error while creating stream:");
        console.error(e);
      }
    }
  };

  const toggle = async () => {
    if (stream) {
      stop();
    } else {
      await start();
    }
  };

  const mergeConstraints = (newConstraints: T) => {
    setConstraints((oldConstraints) => ({
      ...oldConstraints,
      ...newConstraints,
    }));
  };

  useEffect(() => {
    if (!stream) {
      return;
    }

    const videoTrack = stream.getVideoTracks()[0];
    const audioTrack = stream.getAudioTracks()[0];

    if (
      constraints.video !== undefined &&
      typeof constraints.video !== "boolean" &&
      videoTrack
    ) {
      videoTrack.applyConstraints(constraints.video);
    }

    if (
      constraints.audio !== undefined &&
      typeof constraints.audio !== "boolean" &&
      audioTrack
    ) {
      audioTrack.applyConstraints(constraints.audio);
    }
  }, [constraints, stream]);

  const videoConstraints = stream?.getVideoTracks()[0].getConstraints();
  const audioConstraints = stream?.getAudioTracks()[0].getConstraints();

  const videoSettings = stream?.getVideoTracks()[0].getSettings();
  const audioSettings = stream?.getAudioTracks()[0].getSettings();

  useEffect(() => {
    if (stream) {
      return () => {
        stream.getTracks().forEach((track) => track.stop());
      };
    }
  }, [stream]);

  const result: GenericStream<T> = {
    stream,
    toggle,
    mergeConstraints,
    setConstraints,
    videoConstraints,
    audioConstraints,
    videoSettings,
    audioSettings,
  };

  return result;
};

export type GenericStream<T = any> = {
  stream: MediaStream | null;
  toggle: () => Promise<void>;
  mergeConstraints: (newConstraints: T) => void;
  setConstraints: (newConstraints: T) => void;
  videoConstraints?: MediaTrackConstraints;
  audioConstraints?: MediaTrackConstraints;
  videoSettings?: MediaTrackSettings;
  audioSettings?: MediaTrackSettings;
};
