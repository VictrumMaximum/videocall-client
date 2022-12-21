import React, { useEffect, useRef } from "react";

import { SocketUser } from "../SocketConnection/SocketTypes";

import styles from "./RemoteVideos.module.scss";

interface Props {
  stream: MediaStream | null;
  user: SocketUser;
  nickname?: string;
}

export const RemoteCamera = ({ user, stream }: Props) => {
  const ref = useRef<HTMLVideoElement>(null);

  console.log("remotecamera");

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream || stream.getVideoTracks().length === 0) {
    return <PlaceHolder user={user} />;
  }

  return (
    <video
      className={styles.remoteVideo}
      id={user.id}
      ref={ref}
      autoPlay
    ></video>
  );
};

interface PlaceHolderProps {
  user: SocketUser;
}

const PlaceHolder = ({ user }: PlaceHolderProps) => {
  return <div className={styles.placeHolder}>{user.name || user.id}</div>;
};
