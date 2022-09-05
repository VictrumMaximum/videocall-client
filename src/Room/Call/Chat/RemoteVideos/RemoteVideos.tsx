import React, { useEffect, useState } from 'react';
import { getConnection } from '../../Connection/Connection';
import { RemoteVideo } from './RemoteVideo';

interface RemoteVideosState {
  [userId: string]: {
    stream: MediaStream;
    name?: string;
  };
}

export const RemoteVideos = () => {
  const [remoteVideos, setRemoteVideos] = useState<RemoteVideosState>({});

  const addRemoteVideo = (
    userId: string,
    remoteVideo: RemoteVideosState[string]
  ) =>
    setRemoteVideos((currentVideos) => ({
      ...currentVideos,
      [userId]: remoteVideo,
    }));

  const removeRemoteVideo = (userId: string) =>
    setRemoteVideos((currentVideos) => {
      const copy = { ...currentVideos };
      delete copy[userId];
      return copy;
    });

  useEffect(() => {
    const connection = getConnection();
    const publisher = connection.getPublisher();
    const peerConnectionManager = connection.getPeerConnectionManager();

    const a = publisher.subscribe('user-joined-room', (msg) => {
      const remoteUserId = msg.source.id;
      const pc = peerConnectionManager.createPeerConnection(remoteUserId);

      const stream = new MediaStream();

      addRemoteVideo(msg.source.id, {
        stream,
        name: msg.source.name,
      });

      pc.ontrack = (event: RTCTrackEvent) => {
        const track = event.track;

        if (track.kind === 'video' && stream.getVideoTracks()[0]) {
          stream.getVideoTracks()[0].stop();
          stream.removeTrack(stream.getVideoTracks()[0]);
        }
        if (track.kind === 'audio' && stream.getAudioTracks()[0]) {
          stream.getAudioTracks()[0].stop();
          stream.removeTrack(stream.getAudioTracks()[0]);
        }
        console.log('adding track');
        console.log(track);
        stream.addTrack(track);
      };
    });

    const b = publisher.subscribe('user-left-room', (msg) => {
      const userId = msg.source.id;
      removeRemoteVideo(userId);
      peerConnectionManager.removePeerConnection(userId);
    });

    return () => {
      publisher.unsubscribe('user-joined-room', a);
      publisher.unsubscribe('user-left-room', b);
    };
  }, []);

  return (
    <>
      {Object.entries(remoteVideos).map(([userId, state]) => (
        <RemoteVideo key={userId} userId={userId} {...state} />
      ))}
    </>
  );
};
