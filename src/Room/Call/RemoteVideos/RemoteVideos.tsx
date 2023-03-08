import React from "react";
import { Peer, usePeers } from "../PeerConnection/PeerContext";
import { MainVideo } from "./MainVideo";

import styles from "./RemoteVideos.module.scss";
import { SideVideo } from "./SideVideo";

export const RemoteVideos = () => {
  const { peers } = usePeers();

  // NOTE: currently only displaying one peer.
  const peer = peers.length > 0 ? peers[0] : null;

  const element = peer ? <PeerVideo peer={peer} /> : <NoPeer />;

  return <div className={styles.container}>{element}</div>;
};

type PeerVideoProps = {
  peer: Peer;
};

const PeerVideo = (props: PeerVideoProps) => {
  const { peer } = props;

  const cameraConnection = peer.connections.camera;
  const screenConnection = peer.connections.screen;

  const isScreenActive = screenConnection.isSharingVideo;

  const userPlaceHolder = peer && (
    <div className={styles.userPlaceHolder}>
      {peer.user.name || peer.user.id}
    </div>
  );

  const mainConnection = isScreenActive ? screenConnection : cameraConnection;
  const sideConnection = isScreenActive ? cameraConnection : null;

  return (
    <div className={styles.peerVideoContainer}>
      <MainVideo
        stream={mainConnection.incomingStream}
        showVideoTrack={mainConnection.isSharingVideo}
        placeHolder={userPlaceHolder}
      />

      <SideVideo
        stream={sideConnection?.incomingStream || null}
        showVideoTrack={sideConnection?.isSharingVideo || false}
      />
    </div>
  );
};

const NoPeer = () => null;
