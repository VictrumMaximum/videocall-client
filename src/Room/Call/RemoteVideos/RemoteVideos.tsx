import React from "react";
import { StreamContent } from "../PeerConnection/handlers/TrackManagement";
import { Peer, usePeers } from "../PeerConnection/PeerContext";
import { RemoteCamera } from "./RemoteCamera";

import styles from "./RemoteVideos.module.scss";

export const RemoteVideos = () => {
  const { peers } = usePeers();

  const peersArray = Object.values(peers);

  console.log(peersArray[0]);

  const screenSharer = peersArray.find((peer) => {
    return !!peer.streams.screen;
  });

  const focussed = screenSharer
    ? [screenSharer]
    : peersArray.filter((peer) => peer !== screenSharer);

  return (
    <div className={styles.container}>
      <FocusArea>
        {focussed.map((peer) => (
          <RemoteCamera
            key={peer.user.id}
            stream={screenSharer ? peer.streams.screen : peer.streams.user}
            {...peer}
          />
        ))}
      </FocusArea>
      {screenSharer && (
        <VerticalVideoBar>
          {peersArray.map((peer) => (
            <RemoteCamera
              key={peer.user.id}
              stream={peer.streams.user}
              {...peer}
            />
          ))}
        </VerticalVideoBar>
      )}
    </div>
  );
};

const FocusArea: React.FC = ({ children }) => {
  return <div className={styles.focusContainer}>{children}</div>;
};

const VerticalVideoBar: React.FC = ({ children }) => {
  return <div className={styles.verticalVideoBar}>{children}</div>;
};
