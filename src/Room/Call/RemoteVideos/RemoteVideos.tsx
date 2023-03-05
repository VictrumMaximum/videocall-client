import React, { useEffect, useRef, useState } from "react";
import { StreamContent } from "../PeerConnection/handlers/TrackManagement";
import { Peer, usePeers } from "../PeerConnection/PeerContext";
import { RemoteCamera } from "./RemoteCamera";

import styles from "./RemoteVideos.module.scss";

type Streams = {
  mainStream: MediaStream | null;
  sideStream: MediaStream | null;
};

export const RemoteVideos = () => {
  const { peers } = usePeers();
  const [streams, setStreams] = useState<Streams>({
    mainStream: null,
    sideStream: null,
  });

  // NOTE: currently only displaying one peer.
  const peer = peers.length > 0 ? peers[0] : null;

  const userStream = peer?.streams.user || null;
  const screenStream = peer?.streams.screen;

  useEffect(() => {
    setStreams({
      mainStream: screenStream ?? userStream,
      sideStream: screenStream ? userStream : null,
    });
  }, [userStream, screenStream]);

  const userPlaceHolder = peer && (
    <div className={styles.userPlaceHolder}>
      {peer.user.name || peer.user.id}
    </div>
  );

  return (
    <div className={styles.container}>
      <div className={styles.mainVideoContainer}>
        <Video stream={streams.mainStream} placeHolder={userPlaceHolder} />
      </div>
      <div className={styles.sideVideoContainer}>
        <Video stream={streams.sideStream} />
      </div>
    </div>
  );
};

const Content = () => {};

type VideoProps = {
  stream: MediaStream | null;
  placeHolder?: React.ReactElement | null;
};

const Video = (props: VideoProps) => {
  const { stream, placeHolder } = props;
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  if (stream) {
    return (
      <video
        className={styles.video}
        // id={user.id}
        ref={ref}
        autoPlay
      ></video>
    );
  }

  return placeHolder || null;
};
