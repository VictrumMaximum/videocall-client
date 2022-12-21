import React, { createContext, useContext } from "react";
import { useUserDevices } from "./UserStreams";

interface IStreamContext {
  userDevices: {
    stream: MediaStream | null;
    mediaDevices: MediaDeviceInfo[];
    toggleCamera: () => void;
    toggleMic: () => void;
    setCameraDeviceId: (deviceId: string) => void;
    setMicDeviceId: (deviceId: string) => void;
  };
}

const StreamContext = createContext<IStreamContext | null>(null);

export const StreamProvider: React.FC = ({ children }) => {
  const userDevices = useUserDevices();

  return (
    <StreamContext.Provider value={{ userDevices }}>
      {children}
    </StreamContext.Provider>
  );
};

export const useStreams = () => {
  const context = useContext(StreamContext);

  if (!context) {
    throw new Error("StreamContext not defined!");
  }

  return context;
};
