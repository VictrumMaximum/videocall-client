import { Logger } from "../../Settings/Logs/Logs";
import {
  WithMessage,
  WithPeers,
  WithSendToServer,
  WithStreamType,
  WithUserId,
} from "./HandlerArgsTypes";

// called by RTCPeerConnection when new ICE candidate is found for our network
export const handleICECandidateEvent = (
  args: { event: RTCPeerConnectionIceEvent } & WithUserId &
    WithSendToServer &
    WithStreamType
) => {
  const { event, remoteUserId, streamType, sendToServer } = args;

  if (event.candidate) {
    // let others know of our candidate
    sendToServer({
      type: "new-ice-candidate",
      target: remoteUserId,
      candidate: event.candidate,
      streamType,
    });
  }
};

export const handleNewICECandidateMsg = (
  args: WithMessage<"new-ice-candidate"> & WithPeers
) => {
  const { msg, peers } = args;

  const streamType = msg.streamType;

  const userId = msg.source.id;
  if (peers[userId]) {
    peers[userId].connections[streamType].peerConnection
      .addIceCandidate(new RTCIceCandidate(msg.candidate))
      .catch(Logger.error);
  }
};
