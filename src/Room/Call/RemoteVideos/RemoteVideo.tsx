import React, { useEffect, useRef } from "react";

import { SocketUser } from "../SocketConnection/SocketTypes";

import styles from "./RemoteVideos.module.scss";

interface Props {
  stream: MediaStream | null;
  user: SocketUser;
  nickname?: string;
}

export const RemoteVideo = ({ user, stream }: Props) => {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    console.log("stream has changed in RemoteVideo1");
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream || stream.getVideoTracks().length === 0) {
    return <PlaceHolder user={user} />;
  }

  return <video width={"100%"} id={user.id} ref={ref} autoPlay></video>;
};

interface PlaceHolderProps {
  user: SocketUser;
}

const PlaceHolder = ({ user }: PlaceHolderProps) => {
  return <div className={styles.placeHolder}>{user.name || user.id}</div>;
};
