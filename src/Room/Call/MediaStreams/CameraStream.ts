import { useState } from 'react';

const mediaStreamConstraints: MediaStreamConstraints = {
  video: {
    facingMode: 'user',
    // width: 1280,
    // height: 720,
    // frameRate: 30
  },
};

const getCameraStream = (
  cameraConstraints: MediaStreamConstraints['video']
): Promise<MediaStream> => {
  return navigator.mediaDevices.getUserMedia({
    video: cameraConstraints,
  });
};

export const useLocalCameraStream = () => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopStream = () => {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }
  };

  const toggleCamera = async () => {
    if (stream) {
      stopStream();
      setStream(null);
      return;
    }

    try {
      const cameraStream = await getCameraStream(mediaStreamConstraints.video);

      setStream(cameraStream);
    } catch (e) {
      console.error('Error while creating local camera stream:');
      console.error(e);
    }
  };

  return { stream, toggleCamera, stopStream };
};
