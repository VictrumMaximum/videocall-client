import React, { createContext, useContext, useEffect, useMemo } from "react";
import { useUpdateState } from "../../../hooks/useUpdateState";
import { useCamera } from "./CameraStream";
import { useMicrophone } from "./MicrophoneStream";
import { useScreenVideo } from "./ScreenStream";

interface IStreamContext {
  camStream: MediaStream | null;
  micStream: MediaStream | null;
  screenStream: MediaStream | null;
  mediaDevices: MediaDeviceInfo[];
  toggleCam: () => Promise<void>;
  toggleMic: () => Promise<void>;
  toggleScreenVideo: () => Promise<void>;
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

  const { stream: camStream, toggle: toggleCam } = useCamera(cameraConstraints);
  const { stream: micStream, toggle: toggleMic } = useMicrophone();
  const { stream: screenStream, toggle: toggleScreenVideo } = useScreenVideo();

  const value: IStreamContext = useMemo(
    () => ({
      camStream,
      toggleCam,
      updateCameraConstraints,
      micStream,
      toggleMic,
      setMicDeviceId: () => {},
      screenStream,
      toggleScreenVideo,
      mediaDevices: [],
    }),
    [
      camStream,
      micStream,
      screenStream,
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
