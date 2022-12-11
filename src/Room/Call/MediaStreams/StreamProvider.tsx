import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocalCameraStream } from './CameraStream';
import { useMicrophoneStream } from './MicrophoneStream';

interface IStreamContext {
  localCameraStream: MediaStream | null;
  toggleLocalCamera: () => Promise<void>;

  localMicrophoneStream: MediaStream | null;
  toggleLocalMicrophone: () => Promise<void>;
}

const StreamContext = createContext<IStreamContext | null>(null);

export const StreamProvider: React.FC = ({ children }) => {
  const localCamera = useLocalCameraStream();
  const localMicrophone = useMicrophoneStream();

  // Little hack to only call the useEffect cleanup when unmounting,
  // but still having fresh references to the dependencies.
  const unmountingRef = useRef(false);

  useEffect(
    () => () => {
      unmountingRef.current = true;
    },
    []
  );

  useEffect(
    () => () => {
      if (unmountingRef.current) {
        localCamera.stopLocalCamera();
        localMicrophone.stopLocalMicrophone();
      }
    },
    [localCamera, localMicrophone]
  );

  const value = {
    ...localCamera,
    ...localMicrophone,
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
