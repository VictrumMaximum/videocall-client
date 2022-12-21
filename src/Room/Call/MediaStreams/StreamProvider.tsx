import React, { createContext, useContext, useMemo } from "react";
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
  setCameraDeviceId: (deviceId: string) => void;
  setMicDeviceId: (deviceId: string) => void;
}

const StreamContext = createContext<IStreamContext | null>(null);

export const StreamProvider: React.FC = ({ children }) => {
  const { track: camTrack, toggle: toggleCam } = useCamera();
  const { track: micTrack, toggle: toggleMic } = useMicrophone();
  const { track: screenVideoTrack, toggle: toggleScreenVideo } =
    useScreenVideo();

  const value: IStreamContext = useMemo(
    () => ({
      camTrack,
      toggleCam,
      setCameraDeviceId: () => {},
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
