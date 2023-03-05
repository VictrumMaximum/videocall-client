import { StreamType } from "../../SocketConnection/SocketTypes";
import { Peer, WithPeers } from "../PeerContext";

const streams: Record<StreamType, MediaStream> = {
  camera: new MediaStream(),
  screen: new MediaStream(),
};

export type StreamContent = keyof typeof streams;

type SenderType = keyof Peer["connections"][StreamType]["senders"];

type ManageTrackArgs = {
  track: MediaStreamTrack | null;
  streamType: StreamType;
  senderType: SenderType;
} & WithPeers;

// Send tracks by passing a MediaStreamTrack, or stop tracks by passing null.
export const manageTrack = (args: ManageTrackArgs) => {
  const { streamType, track, senderType, peers } = args;

  if (track) {
    const stream = streams[streamType];

    const sendTrack = (peer: Peer) => {
      const senders = peer.connections[streamType].senders;
      const sender = senders[senderType];
      const pc = peer.connections[streamType].peerConnection;

      if (!sender) {
        console.log(`adding track for ${senderType}`);

        // This triggers negotiation.
        senders[senderType] = pc.addTrack(track, stream);
      } else {
        // If there is already a track defined, replace it.
        // This may or may not trigger negotiation.
        // https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack
        console.log(`replacing track for ${senderType}`);

        sender.replaceTrack(track); // Don't await this promise
      }
    };

    for (const peer of Object.values(peers)) {
      sendTrack(peer);
    }
  } else {
    const stopStrack = (peer: Peer) => {
      console.log(peer);
      const sender = peer.connections[streamType].senders[senderType];

      if (sender) {
        // Stop transmitting but keep the sender alive.
        // This shouldn't trigger re-negotiation.
        sender.replaceTrack(null);
      } else {
        // Do nothing, since there is nothing to stop.
      }
    };

    for (const peer of Object.values(peers)) {
      stopStrack(peer);
    }
  }
};
