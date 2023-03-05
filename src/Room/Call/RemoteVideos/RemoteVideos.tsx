import React, { useEffect, useRef, useState } from "react";
import { Peer, usePeers } from "../PeerConnection/PeerContext";

import styles from "./RemoteVideos.module.scss";

type Streams = {
  mainStream: MediaStream | null;
  sideStream: MediaStream | null;
};

export const RemoteVideos = () => {
  const { peers } = usePeers();

  // NOTE: currently only displaying one peer.
  const peer = peers.length > 0 ? peers[0] : null;

  if (!peer) {
    return <NoPeer />;
  }

  return <PeerVideo peer={peer} />;
};

type PeerVideoProps = {
  peer: Peer;
};

const PeerVideo = (props: PeerVideoProps) => {
  const { peer } = props;

  const [streams, setStreams] = useState<Streams>({
    mainStream: null,
    sideStream: null,
  });

  const [isCameraActive, setIsCameraActive] = useState(true);

  const cameraStream = peer.connections.camera.incomingStream;
  const screenStream = peer.connections.screen.incomingStream;

  useEffect(() => {
    setStreams({
      mainStream: screenStream ?? (isCameraActive ? cameraStream : null),
      sideStream: screenStream ? cameraStream : null,
    });
  }, [cameraStream, screenStream, isCameraActive]);

  useEffect(() => {
    const videoTrack = cameraStream?.getVideoTracks()[0];
    const onMute = () => setIsCameraActive(false);
    const onUnMute = () => setIsCameraActive(true);

    videoTrack?.addEventListener("mute", onMute);
    videoTrack?.addEventListener("unmute", onUnMute);

    return () => {
      videoTrack?.removeEventListener("mute", onMute);
      videoTrack?.removeEventListener("unmute", onUnMute);
    };
  });

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

const NoPeer = () => {
  return null;
};

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
