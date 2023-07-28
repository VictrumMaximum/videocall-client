import React, { useEffect, useState } from "react";
import { useStreams } from "../MediaStreams/StreamProvider";
import styles from "./ToggleButtons.module.scss";
import { useTheme } from "../../../App";
import { useSocket } from "../SocketConnection/SocketConnection";

type ToggleButton = {
  content: string;
  onClick: () => Promise<void>;
};

type ToggleButtonsProps = {
  roomId: string;
  toggleChat: () => void;
  unreadMessageAmount: number;
};

export const ToggleButtons = (props: ToggleButtonsProps) => {
  const { camera, microphone, screen } = useStreams();
  const { colors } = useTheme();
  const { disconnect } = useSocket();

  const toggleButtons: ToggleButton[] = [
    {
      content: "Camera",
      onClick: camera.toggle,
    },
    {
      content: "Mic",
      onClick: microphone.toggle,
    },
    {
      content: "Screen",
      onClick: screen.toggle,
    },
    {
      content: "Chat",
      onClick: () => Promise.resolve(props.toggleChat()),
    },
    {
      content: "Exit",
      onClick: async () => {
        disconnect();
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
  onClick: () => Promise<void>;
  content: React.ReactNode;
  unreadMessageAmount?: number;
}
const RoundButton = (props: RoundButtonProps) => {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);

  const { colors } = useTheme();

  const handleOnClick = () => {
    console.log(props.content);
    console.log("handle on click");
    setLoading(true);

    props.onClick().then(() => {
      setEnabled((oldEnabled) => !oldEnabled);
      setLoading(false);
    });
  };

  const bgColor = !loading && enabled ? colors.color3 : colors.color2;
  const textColor =
    !loading && enabled ? colors["text color 1"] : colors["text color 2"];

  return (
    <div
      className={`${styles.roundButton}`}
      onClick={handleOnClick}
      style={{ backgroundColor: bgColor, color: textColor }}
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
