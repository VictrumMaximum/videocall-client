import React, { useEffect, useState } from 'react';

import styles from './Call.module.scss';
import { Chat } from './Chat/Chat';
import {
  ToggleButtons,
  ToggleButtonsProps,
} from './ToggleButtons/ToggleButtons';
import { RemoteVideos } from './Chat/RemoteVideos/RemoteVideos';
import { LocalVideo } from './LocalVideo/LocalVideo';
import { getConnection } from './Connection/Connection';
import { useNavigate } from 'react-router-dom';
import { stopStream, toggleCamera } from './Connection/StreamManager';

type CallProps = {
  roomId: string;
};

export const Call = ({ roomId }: CallProps) => {
  const navigate = useNavigate();
  const [localCameraStream, setLocalCameraStream] =
    useState<MediaStream | null>(null);

  useEffect(() => {
    const connection = getConnection();
    connection.connect(roomId);

    return () => {
      connection.disconnect();
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
        navigate('/videocall');
      },
    },
  ];

  return (
    <div className={styles.mainContainer}>
      <div className={styles.topBar}></div>
      <div className={styles.content}>
        {localCameraStream && <LocalVideo stream={localCameraStream} />}

        <RemoteVideos />
        <ToggleButtons components={toggleButtons} />
      </div>
      <div className={styles.bottomBar}>
        <Chat />
      </div>
    </div>
  );
};
