import { StreamType } from "../../SocketConnection/SocketTypes";
import { Peer } from "../PeerContext";
import { WithPeers } from "./HandlerArgsTypes";

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
      const connection = peer.connections[streamType];
      const senders = connection.senders;
      const sender = senders[senderType];
      const pc = connection.peerConnection;
      if (!sender) {
        // This triggers negotiation.
        senders[senderType] = pc.addTrack(track, stream);
      } else {
        // If there is already a track defined, replace it.
        // This may or may not trigger negotiation.
        // https://developer.mozilla.org/en-US/docs/Web/API/RTCRtpSender/replaceTrack
        sender.replaceTrack(track); // Don't await this promise
      }
    };
    for (const peer of Object.values(peers)) {
      sendTrack(peer);
      console.log(peer.connections[streamType].dataChannel?.readyState);
      if (peer.connections[streamType].dataChannel?.readyState === "open") {
        peer.connections[streamType].dataChannel?.send(`${senderType}On`);
      }
    }
  } else {
    const stopStrack = (peer: Peer) => {
      const sender = peer.connections[streamType].senders[senderType];
      if (sender) {
        peer.connections[streamType].peerConnection.removeTrack(sender);
        peer.connections[streamType].senders[senderType] = null;
      } else {
        // Do nothing, since there is nothing to stop.
      }
    };
    for (const peer of Object.values(peers)) {
      stopStrack(peer);
      if (peer.connections[streamType].dataChannel?.readyState === "open") {
        peer.connections[streamType].dataChannel?.send(`${senderType}Off`);
      }
    }
  }
};
