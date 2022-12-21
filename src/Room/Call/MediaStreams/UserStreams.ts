import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const getHardwareStream = async (
  constraints: MediaStreamConstraints
): Promise<MediaStream | null> => {
  if (!constraints.audio && !constraints.video) {
    return null;
  }

  try {
    return await navigator.mediaDevices.getUserMedia(constraints);
  } catch (e) {
    console.error(e);
    return null;
  }
};

const objDeepEqual = (a: Record<any, any>, b: Record<any, any>) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

type Require<T, K extends keyof T> = Omit<T, K> & Required<Pick<T, K>>;

export type MyConstraints = {
  audio: Require<MediaTrackConstraints, "deviceId"> | true;
  video: Require<MediaTrackConstraints, "deviceId"> | true;
};

export type MediaSwitch = Record<keyof MyConstraints, boolean>;

export const useUserDevices = () => {
  console.log("useHardwareStream");

  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [mediaDevices, setMediaDevices] = useState<MediaDeviceInfo[]>([]);
  const [constraints, setConstraints] = useState<MyConstraints>({
    video: true,
    audio: true,
  });

  const effectiveConstraintsRef = useRef<Partial<MyConstraints>>(constraints);

  const [mediaSwitch, setMediaSwitch] = useState<MediaSwitch>({
    video: false,
    audio: false,
  });

  useEffect(() => {
    console.log({
      mediaSwitch,
      constraints,
    });
  }, [mediaSwitch, constraints]);

  const handleNewStream = (newStream: MediaStream | null) => {
    console.log("HandleNewStream");
    setStream((oldStream) => {
      console.log(`stopping ${oldStream?.getTracks().length} tracks`);
      stopStream(oldStream);
      streamRef.current = newStream;
      return newStream;
    });
  };

  const getNewStream = useCallback(() => {
    console.log("Updating stream.");
    getHardwareStream(effectiveConstraintsRef.current).then(handleNewStream);
  }, []);

  // Re-fetch correct streams
  useEffect(() => {
    const oldEffectiveConstraints = effectiveConstraintsRef.current;
    effectiveConstraintsRef.current = Object.fromEntries(
      Object.entries(constraints).filter(
        ([key]) => mediaSwitch[key as keyof MyConstraints]
      )
    );

    if (
      !objDeepEqual(oldEffectiveConstraints, effectiveConstraintsRef.current)
    ) {
      getNewStream();
    } else {
      console.log("effective constrains didn't change");
    }
  }, [mediaSwitch, constraints, getNewStream]);

  const updateDevices = useCallback(() => {
    console.log("updating devices...");
    navigator.mediaDevices
      .enumerateDevices()
      .then((mediaDevices) => setMediaDevices(mediaDevices));
  }, []);

  useEffect(() => {
    const supConstraints = navigator.mediaDevices.getSupportedConstraints();
    console.log(supConstraints);
  }, []);

  useEffect(() => {
    updateDevices();
    navigator.mediaDevices.addEventListener("devicechange", updateDevices);

    return () =>
      navigator.mediaDevices.removeEventListener("devicechange", updateDevices);
  }, [updateDevices]);

  // Set default devices when mediaDevices are known.
  useEffect(() => {
    console.log("mediaDevices changed");
    console.log(mediaDevices);

    // deviceId may be an empty string if the user has not given permission to getUserMedia()
    const defaultCamera = mediaDevices.find(
      (device) => device.kind === "videoinput" && device.deviceId.length > 0
    );

    const defaultMic = mediaDevices.find(
      (device) => device.kind === "audioinput" && device.deviceId.length > 0
    );

    console.log({ defaultMic, defaultCamera });

    setConstraints((oldConstraints) => ({
      audio: defaultMic?.deviceId
        ? { deviceId: defaultMic.deviceId }
        : oldConstraints.audio,
      video: defaultCamera?.deviceId
        ? { deviceId: defaultCamera.deviceId }
        : oldConstraints.video,
    }));
  }, [mediaDevices]);

  // Stop stream tracks when unmounting.
  useEffect(
    () => () => {
      console.log("CLEANUP");
      stopStream(streamRef.current);
    },
    []
  );

  const value = useMemo(
    () => ({
      stream,
      mediaDevices,
      setCameraDeviceId: (deviceId: string) =>
        setConstraints((oldConstraints) => ({
          ...oldConstraints,
          video: { deviceId },
        })),
      setMicDeviceId: (deviceId: string) =>
        setConstraints((oldConstraints) => ({
          ...oldConstraints,
          audio: { deviceId },
        })),
      toggleCamera: () => setMediaSwitch((s) => ({ ...s, video: !s.video })),
      toggleMic: () => setMediaSwitch((s) => ({ ...s, audio: !s.audio })),
    }),
    [stream, mediaDevices]
  );

  return value;
};

const stopStream = (stream: MediaStream | null) => {
  stream?.getTracks().forEach((track) => track.stop());
};
