import { useEffect, useState } from 'react';
import styles from './Room.module.scss';
import { Welcome } from './Welcome/Welcome';
import { Call } from './Call/Call';
import { useParams } from 'react-router-dom';
import {
  ConnectionProvider,
  useMySocketListener,
  useSocket,
  useSocketListener,
} from './Call/Connection/ConnectionProvider';

export const Room = () => {
  console.log('RENDER Room');
  const [showWelcome, setShowWelcome] = useState(true);
  const params = useParams();
  const currentRoomId = params.roomId;

  console.log(`currentRoomId: ${currentRoomId}`);

  if (!currentRoomId) {
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
      {showWelcome ? (
        <Welcome start={start} />
      ) : (
        <ConnectionProvider currentRoomId={currentRoomId}>
          {/* <Call /> */}
          <TestComponent listeningTo="echo1" />
          <TestComponent listeningTo="echo2" />
        </ConnectionProvider>
      )}
    </div>
  );
};

type TCProps = {
  listeningTo: string;
};

const TestComponent = ({ listeningTo }: TCProps) => {
  const [messages, setMessages] = useState<string[]>([]);

  const type = `echo_${listeningTo}` as any;
  const lastMessage = useMySocketListener(type);

  const sendToServer = useSocket();

  const onClick = () => {
    sendToServer({
      type,
      message: 'yeah',
    });
  };

  useEffect(() => {
    setMessages([...messages, JSON.stringify(lastMessage)]);
  }, [lastMessage, messages, setMessages]);

  return (
    <div>
      <div>{messages}</div>
      <div>
        <button onClick={onClick}>Send {listeningTo}</button>
      </div>
    </div>
  );
};
