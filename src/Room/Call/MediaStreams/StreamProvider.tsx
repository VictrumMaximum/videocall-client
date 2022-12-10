import React, { createContext, useContext, useEffect } from 'react';
import { useLocalCameraStream } from './CameraStream';

interface IStreamContext {
  localCameraStream: MediaStream | null;
  toggleCamera: () => Promise<void>;
}

const StreamContext = createContext<IStreamContext | null>(null);

export const StreamProvider: React.FC = ({ children }) => {
  const {
    stream: localCameraStream,
    stopStream: stopCameraStream,
    toggleCamera,
  } = useLocalCameraStream();

  useEffect(() => () => stopCameraStream(), [stopCameraStream]);

  const value = {
    localCameraStream,
    toggleCamera,
  };

  return (
    <StreamContext.Provider value={value}>{children}</StreamContext.Provider>
  );
};

export const useStreams = () => {
  const context = useContext(StreamContext);

  if (!context) {
    throw new Error('StreamContext not defined!');
  }

  return context;
};
