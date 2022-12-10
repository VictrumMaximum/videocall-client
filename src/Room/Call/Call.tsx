import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import styles from './Call.module.scss';
import { Chat } from './Chat/Chat';
import { ToggleButtons } from './ToggleButtons/ToggleButtons';
import { RemoteVideos } from './RemoteVideos/RemoteVideos';
import { LocalVideo } from './LocalVideo/LocalVideo';
import { initSocketConnection } from './SocketConnection/SocketConnection';
import { useNavigate } from 'react-router-dom';
import { StreamProvider, useStreams } from './MediaStreams/CameraStream';
import { PeersProvider } from './PeerConnection/PeerContext';

type CallProps = {
  roomId: string;
  nickname: string | null;
};

export const Call = (props: CallProps) => {
  const { roomId, nickname } = props;

  // const [peers, setPeers] = useState<Peers>({});
  const [isConnected, setIsConnected] = useState(false);

  const socketConnection = useMemo(
    () => initSocketConnection(roomId, setIsConnected),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // const peerConnectionManager = useMemo(
  //   () =>
  //     initPeerConnectionManager(
  //       socketConnection,
  //       streamManager,
  //       peers,
  //       setPeers
  //     ),
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  //   []
  // );

  useEffect(() => {
    return () => {
      socketConnection.disconnect();
      // peerConnectionManager.reset();
      // streamManager.stopStream();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // useEffect(() => {
  //   if (localCameraStream) {
  //     peerConnectionManager.sendVideo();
  //   }
  // }, [localCameraStream, peerConnectionManager]);

  console.log('hi');

  return (
    <SocketContext.Provider value={{ socketConnection }}>
      <StreamProvider>
        <PeersProvider>
          <div className={styles.mainContainer}>
            {/* <div className={styles.topBar}></div> */}
            {<LocalVideo />}
            <RemoteVideos />
            <ToggleButtons roomId={roomId} />
            <div className={styles.bottomBar}>
              <Chat />
            </div>
          </div>
        </PeersProvider>
      </StreamProvider>
    </SocketContext.Provider>
  );
};

interface ISocketContext {
  socketConnection: ReturnType<typeof initSocketConnection>;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useConnections = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('CallContext is not defined!');
  }

  return context;
};
