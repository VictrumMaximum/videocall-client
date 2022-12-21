import React from "react";
import { usePeers } from "../PeerConnection/PeerContext";
import { RemoteVideo } from "./RemoteVideo";

import styles from "./RemoteVideos.module.scss";

export const RemoteVideos = () => {
  const { peers } = usePeers();

  return (
    <div className={styles.container}>
      {Object.entries(peers).map(([userId, state]) => {
        return (
          <RemoteVideo key={userId} stream={state.streams.user} {...state} />
        );
      })}
    </div>
  );
};
