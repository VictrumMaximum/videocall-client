import styles from './Room.module.scss';
import { Call } from './Call/Call';
import { Navigate, useParams } from 'react-router-dom';
import { LocalStorage } from '../LocalStorage/LocalStorage';
import { useEffect } from 'react';

let filledInDetails = false;

export const setFilledInDetails = (bool: boolean) => (filledInDetails = bool);

export const Room = () => {
  const params = useParams();
  const roomIdParam = params.roomId;

  useEffect(
    () => () => {
      setFilledInDetails(false);
    },
    []
  );

  if (!filledInDetails || !roomIdParam) {
    const path = `/videocall/${roomIdParam}`;
    return <Navigate to={path} />;
  }

  const nickname = LocalStorage.nickname.getNickname();

  return (
    <div className={styles.mainContainer}>
      <Call roomId={roomIdParam || ''} nickname={nickname} />
    </div>
  );
};
