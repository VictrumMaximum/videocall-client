import { useGenericStream } from './GenericStream';

const getMicrophoneStream = () => {
  return navigator.mediaDevices.getUserMedia({
    audio: true,
    video: {
      facingMode: 'user',
    },
  });
};

export const useMicrophoneStream = () => {
  const { stream, toggleStream, stopStream } =
    useGenericStream(getMicrophoneStream);

  return {
    localMicrophoneStream: stream,
    toggleLocalMicrophone: toggleStream,
    stopLocalMicrophone: stopStream,
  };
};
