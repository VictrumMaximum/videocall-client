import { useState } from "react";
import styles from "./Room.module.scss";
import { Welcome } from "./Welcome/Welcome";
import { Call } from "./Call/Call";

export const Room = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const start = (nickname: string) => {
    if (nickname.length > 0) {
      window.localStorage.setItem("nickname", nickname);
    } else {
      window.localStorage.removeItem("nickname");
    }
    setShowWelcome(false);
  };

  return (
    <div className={styles.mainContainer}>
      {showWelcome ? <Welcome start={start} /> : <Call />}
    </div>
  );
};
