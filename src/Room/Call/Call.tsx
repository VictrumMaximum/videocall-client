import React from "react";

import styles from "./Call.module.scss";
import { Chat } from "./Chat/Chat";
import { ToggleButtons } from "./ToggleButtons/ToggleButtons";
import { RemoteVideos } from "./RemoteVideos/RemoteVideos";
import { LocalVideo } from "./LocalVideo/LocalVideo";
import { SocketProvider } from "./SocketConnection/SocketConnection";
import { PeersProvider } from "./PeerConnection/PeerContext";
import { StreamProvider } from "./MediaStreams/StreamProvider";

type CallProps = {
  roomId: string;
  nickname: string | null;
};

export const Call = (props: CallProps) => {
  const { roomId } = props;

  return (
    <SocketProvider roomId={roomId}>
      <StreamProvider>
        <PeersProvider>
          <div className={styles.mainContainer}>
            {/* <div className={styles.topBar}></div> */}
            {<LocalVideo />}
            <RemoteVideos />
            <ToggleButtons roomId={roomId} />
            {/* <div className={styles.bottomBar}> */}
            <Chat />
            {/* </div> */}
          </div>
        </PeersProvider>
      </StreamProvider>
    </SocketProvider>
  );
};
