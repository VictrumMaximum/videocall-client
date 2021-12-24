import { useParams } from "react-router-dom";
import styles from "./Room.module.scss";

export const Room = () => {
  const params = useParams();
  return (
    <div className={styles.mainContainer}>
      <div className={styles.welcomeScreen}>
        <div className={styles.topContainer}>
          <p className={styles.greeting}>Hello</p>
        </div>
        <div className={styles.nicknameContainer}>
          <p className={styles.nicknameHeader}>Your nickname</p>
          <input className={styles.nicknameInput} />
        </div>
        <div className={styles.bottomContainer}>
          <div className={styles.startButton}>Start</div>
        </div>
      </div>
    </div>
  );
};
