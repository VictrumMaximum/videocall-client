import { handleICECandidateEvent } from "./ICE";
import { handleNegotiationNeededEvent } from "./Negotiation";
import {
  Connection,
  Peer,
  WithMessage,
  WithPeers,
  WithSendToServer,
  WithSetPeers,
} from "../PeerContext";
import { SocketUser, StreamType } from "../../SocketConnection/SocketTypes";

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

  const peer = createPeer(user);

  // Add peer to state.
  setPeers({
    ...peers,
    [remoteUserId]: peer,
  });

  Object.entries(peer.connections).forEach((entry) => {
    const streamType = entry[0] as StreamType;
    console.log(`creating callbacks for streamType: ${streamType}`);
    const connection = entry[1] as Connection;

    const pc = connection.peerConnection;

    // Set event handlers
    pc.onicecandidate = (event) =>
      handleICECandidateEvent({
        event,
        remoteUserId,
        sendToServer,
        streamType,
      });

    pc.onnegotiationneeded = () => {
      handleNegotiationNeededEvent({
        pc,
        remoteUserId,
        sendToServer,
        streamType,
      });
    };

    pc.ontrack = (event: RTCTrackEvent) => {
      const [stream] = event.streams;
      const userId = peer.user.id;

      setPeers((oldPeers) => ({
        ...oldPeers,
        [userId]: {
          ...oldPeers[userId],
          connections: {
            ...oldPeers[userId].connections,
            [streamType]: {
              ...oldPeers[userId].connections[streamType],
              incomingStream: stream,
            },
          },
        },
      }));
    };
  });

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

const createPeer = (user: SocketUser): Peer => {
  // Create RTCPeerConnection
  console.log("Creating PeerConnection with user " + user);

  const config = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const pcCamera = new RTCPeerConnection(config);
  const pcScreen = new RTCPeerConnection(config);

  // Create object to keep data about peer in one place.
  return {
    user,
    connections: {
      camera: {
        peerConnection: pcCamera,
        incomingStream: null,
        senders: {
          video: null,
          audio: null,
        },
      },
      screen: {
        peerConnection: pcScreen,
        incomingStream: null,
        senders: {
          video: null,
          audio: null,
        },
      },
    },
  };
};
