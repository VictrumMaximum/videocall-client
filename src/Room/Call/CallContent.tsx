import React, { useState } from "react";

import styles from "./Call.module.scss";
import { Chat } from "./Chat/Chat";
import { ToggleButtons } from "./ToggleButtons/ToggleButtons";
import { RemoteVideos } from "./RemoteVideos/RemoteVideos";
import { LocalVideo } from "./LocalVideo/LocalVideo";

type Props = {
  roomId: string;
};

export const CallContent = ({ roomId }: Props) => {
  const [showChat, setShowChat] = useState(false);

  const toggleChat = () => setShowChat((x) => !x);

  return (
    <div className={styles.mainContainer}>
      {<LocalVideo />}
      <RemoteVideos />
      <ToggleButtons roomId={roomId} toggleChat={toggleChat} />
      <Chat visible={showChat} />
    </div>
  );
};
