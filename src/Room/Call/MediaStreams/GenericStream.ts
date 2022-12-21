import { useState } from "react";

export const useGenericStream = (getStream: () => Promise<MediaStream>) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stopStream = () => {
    if (stream) {
      for (const track of stream.getTracks()) {
        track.stop();
      }
    }
  };

  const toggleStream = async () => {
    if (stream) {
      stopStream();
      setStream(null);
      return;
    }

    try {
      const cameraStream = await getStream();
      setStream(cameraStream);
    } catch (e) {
      console.error("Error while creating stream:");
      console.error(e);
    }
  };

  return { stream, toggleStream, stopStream };
};
