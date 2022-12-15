import React, { useEffect, useRef, useState } from 'react';

import { SocketUser } from '../SocketConnection/SocketTypes';

import styles from './RemoteVideos.module.scss';

interface Props {
  stream: MediaStream;
  user: SocketUser;
  nickname?: string;
}

export const RemoteVideo = ({ user, stream }: Props) => {
  const [hasVideoTrack, setHasVideoTrack] = useState(false);
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    console.log('setting callbacks');

    stream.addEventListener('addtrack', () => {
      console.log('hello addtrack');
    });

    stream.onaddtrack = (event) => {
      console.log('onaddtrack');
      if (event.track.kind === 'video') {
        setHasVideoTrack(true);
      }
    };

    stream.onremovetrack = (event) => {
      if (event.track.kind === 'video') {
        setHasVideoTrack(false);
      }
    };
  }, []);

  // if (!hasVideoTrack) {
  //   return <PlaceHolder user={user} />;
  // }

  return <video width={'100%'} id={user.id} ref={ref} autoPlay></video>;
};

interface PlaceHolderProps {
  user: SocketUser;
}

const PlaceHolder = ({ user }: PlaceHolderProps) => {
  return <div className={styles.placeHolder}>{user.name || user.id}</div>;
};
