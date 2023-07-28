import React from "react";
import { useStreams } from "../MediaStreams/StreamProvider";
import styles from "./ToggleButtons.module.scss";
import { useTheme } from "../../../App";
import { useSocket } from "../SocketConnection/SocketConnection";

type ToggleButton = {
  content: string;
  onClick: () => Promise<void>;
  active: boolean;
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
      active: !!camera.stream,
      enabled: true,
    },
    {
      content: "Mic",
      onClick: microphone.toggle,
      active: !!microphone.stream,
      enabled: true,
    },
    {
      content: "Screen",
      onClick: screen.toggle,
      active: !!screen.stream,
      enabled: !!navigator.mediaDevices.getDisplayMedia,
    },
    {
      content: "Chat",
      onClick: () => Promise.resolve(props.toggleChat()),
      active: props.showChat,
      enabled: true,
    },
    {
      content: "Exit",
      onClick: async () => {
        disconnect();
        window.location.href = `/videocall/${props.roomId}`;
      },
      active: false,
      enabled: true,
    },
  ];

  return (
    <div
      className={styles.buttonContainer}
      style={{ color: colors["text color 1"] }}
    >
      {toggleButtons.map(({ onClick, content, active, enabled }, i) => {
        return (
          <RoundButton
            key={i}
            onClick={onClick}
            content={content}
            active={active}
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
  active: boolean;
  enabled: boolean;
}
const RoundButton = (props: RoundButtonProps) => {
  const { active, enabled } = props;
  const { colors } = useTheme();

  if (!enabled) {
    return null;
  }

  const handleOnClick = () => {
    props.onClick();
  };

  const bgColor = active ? colors.color3 : colors.color2;
  const textColor = active ? colors["text color 1"] : colors["text color 2"];

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
