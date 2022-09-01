import React, { useEffect, useRef } from "react";

interface Props {
  stream: MediaStream;
  userId: string;
  nickname?: string;
}

export const RemoteVideo = ({ userId, stream }: Props) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      console.log("SET MEDIA STREAM ON REMOTE VIDEO");
      ref.current.srcObject = new MediaStream();
    }
  }, []);

  return <video id={userId} ref={ref} autoPlay></video>;
};
