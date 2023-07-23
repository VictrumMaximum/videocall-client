import React, { useState } from "react";

import styles from "./Welcome.module.scss";

import { ReactComponent as CircleIcon } from "./circle.svg";
import { useNavigate, useParams } from "react-router-dom";
import { LocalStorage } from "../Utils/LocalStorage/LocalStorage";
import { setFilledInDetails } from "../Room/Room";
import { targetValueSetter } from "../Utils/InputUtils";
import { useTheme } from "../App";

interface Props {}

export const Welcome = (props: Props) => {
  const params = useParams();
  const navigate = useNavigate();
  const { colors } = useTheme();

  const roomIdParam = params.roomId || "";
  const lastNickname = LocalStorage.nickname.getNickname() || "";

  const [roomName, setRoomName] = useState(roomIdParam);
  const [nickname, setNickname] = useState(lastNickname);

  const setAndSaveNickname = (newNN: string) => {
    setNickname(newNN);
    LocalStorage.nickname.setNickname(newNN);
  };

  const joinRoom = () => {
    if (!roomName) {
      return;
    }

    setFilledInDetails(true);

    navigate(`/videocall/room/${roomName.toLowerCase()}`, {});
  };

  return (
    <div
      className={styles.welcomeScreen}
      style={{ backgroundColor: colors.color3, color: colors["text color 1"] }}
    >
      <div className={styles.bubbleContainer}>
        {bubbles.map(({ size, offsetBottom, offsetLeft }, i) => (
          <Bubble
            key={i}
            size={size}
            offsetBottom={offsetBottom}
            offsetLeft={offsetLeft}
          />
        ))}
      </div>

      <div className={styles.topContainer}>
        <p
          className={styles.greeting}
          style={{ backgroundColor: colors.color3 }}
        >
          Hello
        </p>
      </div>
      <div className={styles.nicknameContainer}>
        <p
          className={styles.nicknameHeader}
          style={{ backgroundColor: colors.color3 }}
        >
          Your nickname
        </p>
        <input
          style={{
            color: colors["text color 1"],
            backgroundColor: colors.color2,
          }}
          className={styles.nicknameInput}
          onChange={targetValueSetter(setAndSaveNickname)}
          value={nickname}
        />
      </div>
      <div className={styles.roomContainer}>
        <p className={styles.nicknameHeader}>Room name</p>
        <input
          style={{
            color: colors["text color 1"],
            backgroundColor: colors.color2,
          }}
          className={styles.nicknameInput}
          onChange={targetValueSetter(setRoomName)}
          value={roomName}
          autoCapitalize={"none"}
        />
      </div>
      <div className={styles.bottomContainer}>
        <div
          className={styles.startButton}
          style={{ backgroundColor: colors.color1 }}
          onClick={joinRoom}
        >
          Join
        </div>
      </div>
    </div>
  );
};

// TODO: make this dependent on the screen size
const amountOfBubbles = 30;

const bubbles: BubbleProps[] = new Array(amountOfBubbles)
  .fill(null)
  .map(() => ({
    size: 30 + Math.floor(Math.random() * 50),
    offsetBottom: Math.floor(Math.random() * 100),
    offsetLeft: Math.floor(Math.random() * 100),
  }));

type BubbleProps = {
  size: number;
  offsetBottom: number;
  offsetLeft: number;
};
const Bubble = (props: BubbleProps) => {
  const size = `${props.size}px`;
  const offsetBottom = `${props.offsetBottom}%`;
  const offsetLeft = `${props.offsetLeft}%`;
  const { colors } = useTheme();
  return (
    <CircleIcon
      width={size}
      height={size}
      style={{
        stroke: colors.color1,
        position: "fixed",
        bottom: offsetBottom,
        left: offsetLeft,
      }}
    />
  );
};
