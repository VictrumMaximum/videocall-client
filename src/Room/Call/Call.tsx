import React from "react";
import styles from "./Call.module.scss";
import { Chat } from "./Chat/Chat";
import { ToggleButtons } from "./ToggleButtons/ToggleButtons";
import { RemoteVideos } from "./Chat/RemoteVideos/RemoteVideos";
import { LocalVideo } from "./LocalVideo/LocalVideo";

export const Call = () => {
  return (
    <div className={styles.mainContainer}>
      <div className={styles.topBar}></div>
      <div className={styles.content}>
        <LocalVideo />
        <RemoteVideos />
        <ToggleButtons />
      </div>
      <div className={styles.bottomBar}>
        <Chat />
      </div>
    </div>
  );
};
