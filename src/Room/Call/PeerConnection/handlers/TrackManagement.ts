import { Peer, WithPeers } from "../PeerContext";

const streams = {
  user: new MediaStream(),
  screen: new MediaStream(),
};

interface StreamInfo {
  stream: MediaStream;
  track: MediaStreamTrack;
}

type SenderType = keyof Peer["senders"];

type ManageTrackArgs = {
  track: MediaStreamTrack | null;
  streamLabel: keyof typeof streams;
  senderType: SenderType;
} & WithPeers;

export const manageTrack = (args: ManageTrackArgs) => {
  const { streamLabel, track, senderType, peers } = args;

  const streamInfo = track
    ? {
        stream: streams[streamLabel],
        track,
      }
    : null;

  const sendTrack = (streamInfo: StreamInfo) => (peer: Peer) => {
    console.log("sendtrack");
    const { stream, track } = streamInfo;

    const sender = peer.senders[senderType];

    if (!sender || !sender.track) {
      console.log(`${senderType} not found`);

      // This triggers negotiation.
      peer.senders[senderType] = peer.peerConnection.addTrack(track, stream);
    } else {
      console.log(`${senderType} found`);
      // If there is already a track defined, replace it.
      // This may or may not trigger negotiation.
      // https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack
      sender.replaceTrack(track); // Don't await this promise
    }
  };

  const stopStrack = (peer: Peer) => {
    console.log("stoptrack");
    const sender = peer.senders[senderType];

    if (sender) {
      console.log(`${senderType} found`);
      // Stop transmitting but keep the sender alive.
      // This shouldn't trigger re-negotiation.
      sender.replaceTrack(null);
    } else {
      // Do nothing, since there is nothing to stop.
    }
  };

  const fun = streamInfo ? sendTrack(streamInfo) : stopStrack;

  for (const peer of Object.values(peers)) {
    fun(peer);
  }
};
