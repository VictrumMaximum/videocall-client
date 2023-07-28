import React, { createContext, useContext, useMemo } from "react";
import { useCamera } from "./CameraStream";
import { useMicrophone } from "./MicrophoneStream";
import { useScreenVideo } from "./ScreenStream";
import { GenericStream } from "./GenericStream";
import { useUserMedia } from "./UserMediaStream";

interface IStreamContext {
  camera: ReturnType<typeof useUserMedia>;
  microphone: ReturnType<typeof useUserMedia>;
  screen: GenericStream;
  mediaDevices: MediaDeviceInfo[];
}

const StreamContext = createContext<IStreamContext | null>(null);

export const StreamProvider: React.FC = ({ children }) => {
  const camera = useCamera();
  const microphone = useMicrophone();
  const screen = useScreenVideo();

  const value: IStreamContext = useMemo(
    () => ({
      camera,
      microphone,
      screen,
      mediaDevices: [],
    }),
    [camera, microphone, screen]
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
