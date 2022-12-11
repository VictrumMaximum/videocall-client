import { useGenericStream } from './GenericStream';

const cameraConstraints: MediaStreamConstraints['video'] = {
  facingMode: 'user',
  // width: 1280,
  // height: 720,
  // frameRate: 30
};

const getCameraStream = (): Promise<MediaStream> => {
  return navigator.mediaDevices.getUserMedia({
    video: cameraConstraints,
  });
};

export const useLocalCameraStream = () => {
  const { stream, toggleStream, stopStream } =
    useGenericStream(getCameraStream);

  return {
    localCameraStream: stream,
    toggleLocalCamera: toggleStream,
    stopLocalCamera: stopStream,
  };
};
