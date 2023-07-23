import { useEffect, useState } from "react";

export const useGenericTrack = (getStream: () => Promise<MediaStream>) => {
  const [stream, setStream] = useState<MediaStream | null>(null);

  const stop = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const toggle = async () => {
    if (stream) {
      stop();
      return;
    }

    try {
      const stream = await getStream();
      setStream(stream);
    } catch (e) {
      console.error("Error while creating stream:");
      console.error(e);
    }
  };

  useEffect(() => {
    if (stream) {
      return () => {
        stream.getTracks().forEach((track) => track.stop());
      };
    }
  }, [stream]);

  return { stream, toggle, stop };
};
