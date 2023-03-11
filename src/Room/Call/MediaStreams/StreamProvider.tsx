import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useUpdateState } from "../../../hooks/useUpdateState";
import { useCamera } from "./CameraStream";
import { useMicrophone } from "./MicrophoneStream";
import { useScreenVideo } from "./ScreenStream";

interface IStreamContext {
  camTrack: MediaStreamTrack | null;
  micTrack: MediaStreamTrack | null;
  screenVideoTrack: MediaStreamTrack | null;
  mediaDevices: MediaDeviceInfo[];
  toggleCam: () => void;
  toggleMic: () => void;
  toggleScreenVideo: () => void;
  updateCameraConstraints: (contraints: CameraConstraints) => void;
  setMicDeviceId: (deviceId: string) => void;
}

const StreamContext = createContext<IStreamContext | null>(null);

type CameraConstraints = Exclude<
  MediaStreamConstraints["video"],
  boolean | undefined
>;
type MicrophoneConstraints = Exclude<
  MediaStreamConstraints["audio"],
  boolean | undefined
>;

export const StreamProvider: React.FC = ({ children }) => {
  const [cameraConstraints, updateCameraConstraints] =
    useUpdateState<CameraConstraints>({ facingMode: "user" });

  useEffect(() => {
    console.log("new camera constraints");
    console.log(cameraConstraints);
  }, [cameraConstraints]);

  const [micConstraints, updateMicConstraints] =
    useUpdateState<MicrophoneConstraints>({});

  const { track: camTrack, toggle: toggleCam } = useCamera(cameraConstraints);
  const { track: micTrack, toggle: toggleMic } = useMicrophone();
  const { track: screenVideoTrack, toggle: toggleScreenVideo } =
    useScreenVideo();

  const value: IStreamContext = useMemo(
    () => ({
      camTrack,
      toggleCam,
      updateCameraConstraints,
      micTrack,
      toggleMic,
      setMicDeviceId: () => {},
      screenVideoTrack,
      toggleScreenVideo,
      mediaDevices: [],
    }),
    [
      camTrack,
      micTrack,
      screenVideoTrack,
      toggleCam,
      updateCameraConstraints,
      toggleMic,
      toggleScreenVideo,
    ]
  );

  return (
    <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
  );
};

export const useStreams = () => {
  const context = useContext(StreamContext);

  if (!context) {
    throw new Error("StreamContext not defined!");
  }

  return context;
};
