import { useState } from 'react';
import styles from './Room.module.scss';
import { Welcome } from './Welcome/Welcome';
import { Call } from './Call/Call';
import { useParams } from 'react-router-dom';

export const Room = () => {
  const [showWelcome, setShowWelcome] = useState(true);
  const params = useParams();
  const roomId = params.roomId;

  if (!roomId) {
    return <div>No room ID.</div>;
  }

  const start = (nickname: string) => {
    if (nickname.length > 0) {
      window.localStorage.setItem('nickname', nickname);
    } else {
      window.localStorage.removeItem('nickname');
    }
    setShowWelcome(false);
  };

  return (
    <div className={styles.mainContainer}>
      {showWelcome ? <Welcome start={start} /> : <Call roomId={roomId} />}
    </div>
  );
};
