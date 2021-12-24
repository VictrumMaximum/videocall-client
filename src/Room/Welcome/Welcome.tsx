import React from "react";
import styles from "./Welcome.module.scss";

interface Props {
  hideWelcome: () => void;
}

export const Welcome = (props: Props) => {
  return (
    <div className={styles.welcomeScreen}>
      <div className={styles.topContainer}>
        <p className={styles.greeting}>Hello</p>
      </div>
      <div className={styles.nicknameContainer}>
        <p className={styles.nicknameHeader}>Your nickname</p>
        <input className={styles.nicknameInput} />
      </div>
      <div className={styles.bottomContainer}>
        <div className={styles.startButton} onClick={props.hideWelcome}>
          Start
        </div>
      </div>
    </div>
  );
};
