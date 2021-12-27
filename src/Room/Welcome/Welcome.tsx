import React, { useState } from "react";
import { targetValueSetter } from "../../Home/Home";
import styles from "./Welcome.module.scss";

interface Props {
  start: (nickname: string) => void;
}

export const Welcome = (props: Props) => {
  const oldNickname = window.localStorage.getItem("nickname") || "";
  const [nickname, setNickname] = useState(oldNickname);

  return (
    <div className={styles.welcomeScreen}>
      <div className={styles.topContainer}>
        <p className={styles.greeting}>Hello</p>
      </div>
      <div className={styles.nicknameContainer}>
        <p className={styles.nicknameHeader}>Your nickname</p>
        <input
          className={styles.nicknameInput}
          onChange={targetValueSetter(setNickname)}
          value={nickname}
        />
      </div>
      <div className={styles.bottomContainer}>
        <div
          className={styles.startButton}
          onClick={() => props.start(nickname)}
        >
          Start
        </div>
      </div>
    </div>
  );
};
