import {
  WithMessage,
  WithPeers,
  WithSendToServer,
  WithUserId,
} from "../PeerContext";

// called by RTCPeerConnection when new ICE candidate is found for our network
export const handleICECandidateEvent = (
  args: { event: RTCPeerConnectionIceEvent } & WithUserId & WithSendToServer
) => {
  const { event, remoteUserId, sendToServer } = args;

  if (event.candidate) {
    // let others know of our candidate
    sendToServer({
      type: "new-ice-candidate",
      target: remoteUserId,
      candidate: event.candidate,
    });
  }
};

export const handleNewICECandidateMsg = (
  args: WithMessage<"new-ice-candidate"> & WithPeers
) => {
  const { msg, peers } = args;

  const userId = msg.source.id;
  if (peers[userId]) {
    peers[userId].peerConnection
      .addIceCandidate(new RTCIceCandidate(msg.candidate))
      .catch(console.error);
  }
};
