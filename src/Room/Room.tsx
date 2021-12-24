import { useState } from "react";
import { useParams } from "react-router-dom";
import styles from "./Room.module.scss";
import { Welcome } from "./Welcome/Welcome";
import { Call } from "./Call/Call";

export const Room = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const params = useParams();
  return (
    <div className={styles.mainContainer}>
      {showWelcome ? (
        <Welcome hideWelcome={() => setShowWelcome(false)} />
      ) : (
        <Call />
      )}
    </div>
  );
};
