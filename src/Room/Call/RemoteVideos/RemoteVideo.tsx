import React, { useEffect, useRef } from 'react';

interface Props {
  stream: MediaStream;
  userId: string;
  nickname?: string;
}

export const RemoteVideo = ({ userId, stream }: Props) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return <video width={'100%'} id={userId} ref={ref} autoPlay></video>;
};
