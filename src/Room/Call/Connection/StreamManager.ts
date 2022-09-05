import { getConnection } from './Connection';

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

export const toggleCamera = async (
  currentStream: MediaStream | null,
  setStream: (stream: MediaStream | null) => void
): Promise<void> => {
  if (currentStream) {
    stopStream(currentStream);
    setStream(null);
  } else {
    try {
      const stream = await getCameraStream(mediaStreamConstraints.video);
      setStream(stream);

      getConnection()
        .getPeerConnectionManager()
        .sendVideo(stream.getVideoTracks()[0]);
    } catch (e) {
      console.error('Error while creating local camera stream:');
      console.error(e);
    }
  }
};

export const stopStream = (stream: MediaStream | null) => {
  if (stream) {
    console.log('stopping stream');
    for (const track of stream.getTracks()) {
      console.log('stopping track');
      track.stop();
    }
  }
};
