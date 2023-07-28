import React from "react";
import { useStreams } from "../MediaStreams/StreamProvider";
import styles from "./ToggleButtons.module.scss";
import { useTheme } from "../../../App";
import { useSocket } from "../SocketConnection/SocketConnection";
import { Logger } from "../Settings/Logs/Logs";

type ToggleButton = {
  content: string;
  onClick: () => Promise<void>;
  enabled: boolean;
};

type ToggleButtonsProps = {
  roomId: string;
  toggleChat: () => void;
  showChat: boolean;
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
      enabled: !!camera.stream,
    },
    {
      content: "Mic",
      onClick: microphone.toggle,
      enabled: !!microphone.stream,
    },
    {
      content: "Screen",
      onClick: screen.toggle,
      enabled: !!screen.stream,
    },
    {
      content: "Chat",
      onClick: () => Promise.resolve(props.toggleChat()),
      enabled: props.showChat,
    },
    {
      content: "Exit",
      onClick: async () => {
        disconnect();
        window.location.href = `/videocall/${props.roomId}`;
      },
      enabled: false,
    },
  ];

  return (
    <div
      className={styles.buttonContainer}
      style={{ color: colors["text color 1"] }}
    >
      {toggleButtons.map(({ onClick, content, enabled }, i) => {
        return (
          <RoundButton
            key={i}
            onClick={onClick}
            content={content}
            enabled={enabled}
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
  enabled: boolean;
}
const RoundButton = (props: RoundButtonProps) => {
  const { enabled } = props;
  Logger.log(`${props.content} enabled is ${enabled}`);

  const { colors } = useTheme();

  const handleOnClick = () => {
    props.onClick();
  };

  const bgColor = enabled ? colors.color3 : colors.color2;
  const textColor = enabled ? colors["text color 1"] : colors["text color 2"];

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
