import { handleICECandidateEvent } from "./ICE";
import { handleNegotiationNeededEvent } from "./Negotiation";
import {
  Peer,
  WithMessage,
  WithPeers,
  WithSendToServer,
  WithSetPeers,
} from "../PeerContext";

export const handleUserJoinedRoom = (
  args: WithMessage<"user-joined-room"> &
    WithSendToServer &
    WithPeers &
    WithSetPeers
) => {
  const { msg, peers, setPeers, sendToServer } = args;
  console.log("handleUserJoinedRoom");

  const user = msg.source;

  const remoteUserId = user.id;

  // Check if peer alraedy exists.
  if (peers[remoteUserId]) {
    console.warn(`peer connection with ${remoteUserId} already exists!`);
    return peers[remoteUserId];
  }

  // Create RTCPeerConnection
  console.log("Creating PeerConnection with user " + remoteUserId);
  const pc = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  // Create object to keep data about peer in one place.
  const peer: Peer = {
    peerConnection: pc,
    user,
    streams: {
      screen: null,
      user: null,
    },
    streamContentMap: {},
    senders: {
      camSender: null,
      micSender: null,
      screenVideoSender: null,
      screenAudioSender: null,
    },
  };

  // Add peer to state.
  setPeers({
    ...peers,
    [remoteUserId]: peer,
  });

  // Set event handlers
  pc.onicecandidate = (event) =>
    handleICECandidateEvent({ event, remoteUserId, sendToServer });

  pc.onnegotiationneeded = () => {
    handleNegotiationNeededEvent({ pc, remoteUserId, sendToServer });
  };

  const setStream = (userId: string, stream: MediaStream) => {
    setPeers((oldPeers) => ({
      ...oldPeers,
      [userId]: {
        ...oldPeers[userId],
        streams: {
          ...oldPeers[userId].streams,
          [oldPeers[userId].streamContentMap[stream.id]]: stream,
        },
      },
    }));
  };

  pc.ontrack = (event: RTCTrackEvent) => {
    const [stream] = event.streams;

    console.log("ontrack setstream");
    setStream(peer.user.id, stream);
  };

  return peer;
};

export const handleUserLeftRoom = (
  args: WithMessage<"user-left-room"> & WithSetPeers & WithPeers
) => {
  const { msg, peers, setPeers } = args;

  const userId = msg.source.id;

  const { [userId]: _, ...rest } = peers;
  setPeers(rest);
};
