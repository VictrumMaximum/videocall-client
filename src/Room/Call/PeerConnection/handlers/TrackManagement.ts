import {
  Peer,
  WithCameraStream,
  WithMicrophoneStream,
  WithPeers,
} from "../PeerContext";

export const manageVideo = (args: WithCameraStream & WithPeers) => {
  const { localCameraStream, peers } = args;

  const stream = localCameraStream;

  const sendTrack = (stream: MediaStream) => (peer: Peer) => {
    console.log("sendtrack");
    const videoTrack = stream.getVideoTracks()[0];
    if (!peer.videoSender || !peer.videoSender.track) {
      console.log("videosender not found");
      // This triggers negotiation.
      peer.videoSender = peer.peerConnection.addTrack(videoTrack, stream);
    } else {
      console.log("videosender found");
      // If there is already a track defined, replace it (switching cameras).
      // This doesn't trigger negotiation.
      peer.videoSender.replaceTrack(videoTrack); // Don't await this promise
    }
  };

  const stopStrack = (peer: Peer) => {
    console.log("stoptrack");
    if (peer.videoSender) {
      console.log("videosender found");
      // This triggers negotiation.
      peer.peerConnection.removeTrack(peer.videoSender);
      peer.videoSender = undefined;
    } else {
      console.log("videosender not found");
      // Camera stopped streaming but we already weren't sending anything to this peer.
      // This should never happen, and even if it did, we don't need to do anything.
    }
  };

  const fun = stream ? sendTrack(stream) : stopStrack;

  for (const peer of Object.values(peers)) {
    fun(peer);
  }
};

export const manageAudio = (args: WithMicrophoneStream & WithPeers) => {
  const { localMicrophoneStream: stream, peers } = args;

  if (!stream) {
    return;
  }

  const audioTrack = stream.getAudioTracks()[0];

  for (const peer of Object.values(peers)) {
    if (peer.audioSender) {
      peer.audioSender.replaceTrack(audioTrack);
    } else {
      peer.audioSender = peer.peerConnection.addTrack(audioTrack);
    }
  }
};
