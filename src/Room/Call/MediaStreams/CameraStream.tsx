import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

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

interface IStreamContext {
  localCameraStream: MediaStream | null;
  toggleCamera: () => Promise<void>;
}

const StreamContext = createContext<IStreamContext | null>(null);

export const StreamProvider: React.FC = ({ children }) => {
  const [localCameraStream, setLocalCameraStream] =
    useState<MediaStream | null>(null);

  const stopStream = useCallback(() => {
    console.log('stopping stream');
    if (localCameraStream) {
      for (const track of localCameraStream.getTracks()) {
        console.log('stopping track');
        track.stop();
      }
    } else {
      console.log('no stream??');
    }
  }, [localCameraStream]);

  const toggleCamera = useCallback(async () => {
    if (localCameraStream) {
      stopStream();
      setLocalCameraStream(null);
      return;
    }

    try {
      const stream = await getCameraStream(mediaStreamConstraints.video);

      setLocalCameraStream(stream);
    } catch (e) {
      console.error('Error while creating local camera stream:');
      console.error(e);
    }
  }, [localCameraStream, stopStream]);

  const value = useMemo(
    () => ({
      localCameraStream,
      toggleCamera,
    }),
    [localCameraStream, toggleCamera]
  );

  useEffect(() => () => stopStream(), [stopStream]);

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

// class StreamManager {
//   private localCameraStream: MediaStream | null;
//   private setLocalCameraStream: (stream: MediaStream | null) => void;

//   constructor(
//     localCameraStream: MediaStream | null,
//     setLocalCameraStream: (stream: MediaStream | null) => void
//   ) {
//     this.localCameraStream = localCameraStream;
//     this.setLocalCameraStream = setLocalCameraStream;
//   }

//   public async toggleCamera() {
//     if (this.localCameraStream) {
//       this.stopStream();
//       this.setLocalCameraStream(null);
//     } else {
//       try {
//         const stream = await getCameraStream(mediaStreamConstraints.video);

//         // This doesn't update this.localVideoStream because
//         // it's not a react component and doesn't get re-rendered...

//         this.setLocalCameraStream(stream);
//       } catch (e) {
//         console.error('Error while creating local camera stream:');
//         console.error(e);
//       }
//     }
//   }

//   public stopStream() {
//     if (this.localCameraStream) {
//       console.log('stopping stream');
//       for (const track of this.localCameraStream.getTracks()) {
//         console.log('stopping track');
//         track.stop();
//       }
//     }
//   }

//   public getLocalCameraStream() {
//     return this.localCameraStream;
//   }
// }

// let instance: StreamManager;

// export const initStreamManager = (
//   localCameraStream: MediaStream | null,
//   setLocalCameraStream: (stream: MediaStream | null) => void
// ) => {
//   if (!instance) {
//     instance = new StreamManager(localCameraStream, setLocalCameraStream);
//   }

//   return instance;
// };
