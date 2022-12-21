import { useEffect, useState } from "react";

export const useGenericTrack = (
  getStream: () => Promise<MediaStream>,
  kind: "audio" | "video"
) => {
  const [track, setTrack] = useState<MediaStreamTrack | null>(null);

  const stop = () => {
    if (track) {
      track.stop();
      setTrack(null);
    }
  };

  const toggle = async () => {
    if (track) {
      stop();
      return;
    }

    try {
      const stream = await getStream();
      const newTrack = stream.getTracks().find((t) => t.kind === kind) || null;
      console.log(newTrack);
      setTrack(newTrack);
    } catch (e) {
      console.error("Error while creating track:");
      console.error(e);
    }
  };

  useEffect(() => {
    if (track) {
      return () => {
        track?.stop();
      };
    }
  }, [track]);

  return { track, toggle, stop };
};
