import { useEffect, useState } from "react";
import { Logger } from "../Settings/Logs/Logs";

const getStream = (constraints: DisplayMediaStreamOptions) => {
  return navigator.mediaDevices.getDisplayMedia(constraints);
};

export const useScreenVideo = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [constraints, setConstraints] = useState<DisplayMediaStreamOptions>({
    audio: true,
    video: true,
  });

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
        Logger.error("Error while creating stream:");
        Logger.error(e);
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

  const mergeConstraints = async (
    newConstraints: DisplayMediaStreamOptions
  ) => {
    setConstraints((oldConstraints) => ({
      ...oldConstraints,
      ...newConstraints,
    }));

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      await start();
    }
  };

  // useEffect(() => {
  //   if (!stream) {
  //     return;
  //   }

  //   const videoTrack = stream.getVideoTracks()[0];
  //   const audioTrack = stream.getAudioTracks()[0];

  //   if (
  //     constraints.video !== undefined &&
  //     typeof constraints.video !== "boolean" &&
  //     videoTrack
  //   ) {
  //     videoTrack.applyConstraints(constraints.video);
  //   }

  //   if (
  //     constraints.audio !== undefined &&
  //     typeof constraints.audio !== "boolean" &&
  //     audioTrack
  //   ) {
  //     audioTrack.applyConstraints(constraints.audio);
  //   }
  // }, [constraints, stream]);

  const videoTrack = stream?.getVideoTracks()[0];
  const audioTrack = stream?.getAudioTracks()[0];

  const videoConstraints = videoTrack?.getConstraints();
  const audioConstraints = audioTrack?.getConstraints();

  const videoSettings = videoTrack?.getSettings();
  const audioSettings = audioTrack?.getSettings();

  useEffect(() => {
    Logger.log("useEffect useUserMedia stream");

    if (stream) {
      const trackEndedEventListener = () => setStream(null);

      const tracks = stream.getTracks();

      Logger.log("setting event listeners");
      tracks.forEach((track) =>
        track.addEventListener("ended", trackEndedEventListener)
      );

      return () => {
        Logger.log("removing event listeners and stopping tracks");

        tracks.forEach((track) =>
          track.removeEventListener("ended", trackEndedEventListener)
        );
        tracks.forEach((track) => track.stop());
      };
    }
  }, [stream]);

  return {
    stream,
    toggle,
    mergeConstraints,
    setConstraints,
    videoConstraints,
    audioConstraints,
    videoSettings,
    audioSettings,
  };
};
