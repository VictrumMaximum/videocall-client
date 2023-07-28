import React, { useState } from "react";

import styles from "./Call.module.scss";
import { Chat } from "./Chat/Chat";
import { ToggleButtons } from "./ToggleButtons/ToggleButtons";
import { RemoteVideos } from "./RemoteVideos/RemoteVideos";
import { LocalVideo } from "./LocalVideo/LocalVideo";
import { SettingsIcon } from "./Settings/SettingsIcon";
import { SettingsPopup } from "./Settings/SettingsPopup";
import { useTheme } from "../../App";

type Props = {
  roomId: string;
};

export const CallContent = ({ roomId }: Props) => {
  const [showChat, setShowChat] = useState(false);
  const [unreadMessageAmount, setUnreadMessageAmount] = useState(0);

  const { colors } = useTheme();

  const [showSettings, setShowSettings] = useState(false);

  const toggleChat = () => {
    setShowChat((x) => !x);
    setUnreadMessageAmount(0);
  };

  const toggleSettings = () => setShowSettings((x) => !x);

  return (
    <div
      className={styles.mainContainer}
      style={{ backgroundColor: colors.color1 }}
    >
      <LocalVideo />
      <SettingsIcon toggleSettings={toggleSettings} />
      {showSettings && <SettingsPopup />}
      <RemoteVideos />
      <ToggleButtons
        roomId={roomId}
        toggleChat={toggleChat}
        showChat={showChat}
        unreadMessageAmount={unreadMessageAmount}
      />
      <Chat
        visible={showChat}
        setUnreadMessageAmount={setUnreadMessageAmount}
      />
    </div>
  );
};
