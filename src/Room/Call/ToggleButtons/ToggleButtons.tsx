import React, { useState } from "react";
import { useStreams } from "../MediaStreams/StreamProvider";
import styles from "./ToggleButtons.module.scss";
import { useTheme } from "../../../App";

type ToggleButton = {
  content: string;
  onClick: () => void;
};

type ToggleButtonsProps = {
  roomId: string;
  toggleChat: () => void;
  unreadMessageAmount: number;
};

export const ToggleButtons = (props: ToggleButtonsProps) => {
  const { toggleCam, toggleMic, toggleScreenVideo } = useStreams();
  const { colors } = useTheme();

  const toggleButtons: ToggleButton[] = [
    {
      content: "Camera",
      onClick: toggleCam,
    },
    {
      content: "Mic",
      onClick: toggleMic,
    },
    {
      content: "Screen",
      onClick: toggleScreenVideo,
    },
    {
      content: "Chat",
      onClick: () => props.toggleChat(),
    },
    {
      content: "Exit",
      onClick: () => {
        window.location.href = `/videocall/${props.roomId}`;
      },
    },
  ];

  return (
    <div
      className={styles.buttonContainer}
      style={{ color: colors["text color 1"] }}
    >
      {toggleButtons.map(({ onClick, content }, i) => {
        return (
          <RoundButton
            key={i}
            onClick={onClick}
            content={content}
            unreadMessageAmount={
              content === "Chat" ? props.unreadMessageAmount : undefined
            }
          />
        );
      })}
    </div>
  );
};

interface RoundButtonProps {
  onClick: (setEnabled: (enabled: boolean) => void) => void;
  content: React.ReactNode;
  unreadMessageAmount?: number;
}
const RoundButton = (props: RoundButtonProps) => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();

  const handleOnClick = () => {
    setLoading(true);

    props.onClick(() => {
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
      style={{ backgroundColor: colors.color2 }}
    >
      {!!props.unreadMessageAmount && (
        <div
          className={styles.notificationCounter}
          style={{ backgroundColor: colors.color3 }}
        >
          {props.unreadMessageAmount}
        </div>
      )}
      {props.content}
    </div>
  );
};
