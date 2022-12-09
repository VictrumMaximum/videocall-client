import React, { useEffect, useState } from 'react';

import styles from './Call.module.scss';
import { Chat } from './Chat/Chat';
import {
  ToggleButtons,
  ToggleButtonsProps,
} from './ToggleButtons/ToggleButtons';
import { RemoteVideos } from './RemoteVideos/RemoteVideos';
import { LocalVideo } from './LocalVideo/LocalVideo';
import { getConnection } from './SocketConnection/Connection';
import { useNavigate } from 'react-router-dom';
import {
  sendCameraStream,
  stopStream,
  toggleCamera,
} from './MediaStreams/CameraStream';

type CallProps = {
  roomId: string;
  nickname: string | null;
};

export const Call = (props: CallProps) => {
  const { roomId, nickname } = props;

  const navigate = useNavigate();
  const [localCameraStream, setLocalCameraStream] =
    useState<MediaStream | null>(null);

  useEffect(() => {
    const connection = getConnection();
    connection.connect(roomId);

    const subHandle = connection
      .getPublisher()
      .subscribe('user-joined-room', (msg) => {
        if (localCameraStream) {
          sendCameraStream(localCameraStream);
        }
      });

    return () => {
      connection.disconnect();
      connection.getPublisher().unsubscribe('user-joined-room', subHandle);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Second unmounting callback, because I don't want to put localCameraStream
  // in the dependency array of the first useEffect()
  useEffect(() => () => stopStream(localCameraStream), [localCameraStream]);

  const toggleButtons: ToggleButtonsProps['components'] = [
    {
      content: 'Camera',
      onClick: () => toggleCamera(localCameraStream, setLocalCameraStream),
    },
    {
      content: 'Exit',
      onClick: () => {
        navigate(`/videocall/${roomId}`);
      },
    },
  ];

  return (
    <div className={styles.mainContainer}>
      {/* <div className={styles.topBar}></div> */}
      {localCameraStream && <LocalVideo stream={localCameraStream} />}
      <RemoteVideos />
      <ToggleButtons components={toggleButtons} />
      <div className={styles.bottomBar}>
        <Chat />
      </div>
    </div>
  );
};
