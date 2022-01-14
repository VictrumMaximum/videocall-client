import React, { useContext, useState } from "react";
import { useSocket } from "../ConnectionProvider";
import styles from "./Call.module.scss";
import { Chat } from "./Chat/Chat";

export const Call = () => {
  const { roomId } = useSocket();

  console.log(`roomId: ${roomId}`);

  return (
    <div className={styles.mainContainer}>
      <div className={styles.topBar}></div>
      <div className={styles.content}>
        <div className={styles.buttonContainer}>
          {/* <RoundButton
            onClick={(toggleIcon) => toggleCamera(toggleIcon)}
            text="Camera"
          />
          <RoundButton onClick={() => console.log("exit")} text="Exit" /> */}
        </div>
      </div>
      <div className={styles.bottomBar}>
        <Chat />
      </div>
    </div>
  );
};

interface RoundButtonProps {
  onClick: (setEnabled: (enabled: boolean) => void) => void;
  text: string;
}
const RoundButton = (props: RoundButtonProps) => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleOnClick = () => {
    setLoading(true);
    props.onClick((enabled) => {
      setEnabled(enabled);
      setLoading(false);
    });
  };

  const activeClass = !loading && enabled ? styles.activeButton : "";
  const loadingClass = loading ? styles.loadingButton : "";

  return (
    <div
      className={`${styles.roundButton} ${activeClass} ${loadingClass}`}
      onClick={handleOnClick}
    >
      {props.text}
    </div>
  );
};
