import React, { useEffect, useMemo, useState } from 'react';
import { RemoteVideo } from './RemoteVideo';

export let createRemoteVideo: (remoteUserId: string, nickname?: string) => void;
export let removeRemoteVideo: (remoteUserId: string) => void;
export let addTrack: (remoteUserId: string, track: MediaStreamTrack) => void;

const remoteVideos: RemoteVideos = {};

interface RemoteVideos {
  [userId: string]: {
    stream: MediaStream;
    nickname?: string;
  };
}

export const RemoteVideos = () => {
  useEffect(() => {
    console.log('initializing remote videos callbacks ');
    createRemoteVideo = (remoteUserId, nickname) => {
      console.log('createRemoteVideo');
      remoteVideos[remoteUserId] = {
        stream: new MediaStream(),
        nickname: nickname,
      };
    };
    removeRemoteVideo = (remoteUserId) => {
      delete remoteVideos[remoteUserId];
    };
    addTrack = (remoteUserId: string, track: MediaStreamTrack) => {
      console.log('Add track callback');
      const remoteVideo = remoteVideos[remoteUserId];

      if (!remoteVideo) {
        console.error(`Remote user ${remoteUserId} has no remoteVideo!`);
        console.log(remoteVideos);
        return;
      }

      const stream = remoteVideo.stream;

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
  }, []);

  return null;

  // return (
  //   <>
  //     {Object.entries(a).map(([userId, state]) => (
  //       <RemoteVideo key={userId} userId={userId} {...state} />
  //     ))}
  //   </>
  // );
};
