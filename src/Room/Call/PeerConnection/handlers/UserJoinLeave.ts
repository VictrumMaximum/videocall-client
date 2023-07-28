import { handleICECandidateEvent } from "./ICE";
import { handleNegotiationNeededEvent } from "./Negotiation";
import { Connection, Peer, Peers } from "../PeerContext";
import {
  WithMessage,
  WithPeers,
  WithSendToServer,
  WithSetPeers,
  WithUserId,
} from "./HandlerArgsTypes";
import { SocketUser, StreamType } from "../../SocketConnection/SocketTypes";
import { Logger } from "../../Settings/Logs/Logs";

export const handleUserJoinedRoom = (
  args: WithMessage<"user-joined-room"> &
    WithSendToServer &
    WithPeers &
    WithSetPeers
) => {
  const { msg, peers, setPeers, sendToServer } = args;
  const remoteUser = msg.source;

  const remoteUserId = remoteUser.id;

  // Check if peer alraedy exists.
  if (peers[remoteUserId]) {
    console.warn(`peer connection with ${remoteUserId} already exists!`);
    return peers[remoteUserId];
  }

  const peer = createPeer(remoteUser);

  // Add peer to state.
  setPeers((oldPeers) => ({
    ...oldPeers,
    [remoteUserId]: peer,
  }));

  Object.entries(peer.connections).forEach((entry) => {
    const streamType = entry[0] as StreamType;
    const connection = entry[1] as Connection;

    const pc = connection.peerConnection;

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === "disconnected") {
        removePeer({ remoteUserId, peers, setPeers });
      }
    };

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
      Logger.log("ontrack");
      const [stream] = event.streams;
      const userId = peer.user.id;

      const hasVideoTrack = stream.getVideoTracks().length > 0;

      const updateConnection =
        (update: Partial<Peer["connections"]["camera"]>) =>
        (oldPeers: Peers) => ({
          ...oldPeers,
          [userId]: {
            ...oldPeers[userId],
            connections: {
              ...oldPeers[userId].connections,
              [streamType]: {
                ...oldPeers[userId].connections[streamType],
                ...update,
              },
            },
          },
        });

      stream.onremovetrack = (event) => {
        if (event.track.kind === "video") {
          setPeers(
            updateConnection({
              isSharingVideo: false,
            })
          );
        }
      };

      setPeers(
        updateConnection({
          incomingStream: stream,
          isSharingVideo: hasVideoTrack,
        })
      );
    };
  });

  return peer;
};

export const handleUserLeftRoom = (
  args: WithMessage<"user-left-room"> & WithSetPeers & WithPeers
) => {
  Logger.log("handleUserLeftRoom");
  const { msg, peers, setPeers } = args;

  const remoteUserId = msg.source.id;

  removePeer({ remoteUserId, peers, setPeers });
};

const removePeer = ({
  remoteUserId,
  peers,
  setPeers,
}: WithPeers & WithSetPeers & WithUserId) => {
  const { [remoteUserId]: peer, ...rest } = peers;

  Object.values(peer.connections).forEach((connection) => {
    if (connection.peerConnection.connectionState !== "closed") {
      connection.peerConnection.close();
      connection.dataChannel?.close();
    }
  });

  setPeers(rest);
};

const createPeer = (user: SocketUser): Peer => {
  Logger.log("Creating PeerConnection with user:");
  Logger.log(user);

  // Create object to keep data about peer in one place.
  return {
    user,
    connections: {
      camera: createConnection(),
      screen: createConnection(),
    },
  };
};

// Create RTCPeerConnection
const createConnection = (): Peer["connections"]["camera"] => {
  const peerConnection = new RTCPeerConnection({
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  });

  return {
    peerConnection,
    incomingStream: null,
    isSharingVideo: false,
    dataChannel: null,
    // dataChannel: peerConnection.createDataChannel("streamInfo", {
    //   negotiated: true,
    //   id: 0,
    // }),
    senders: {
      video: null,
      audio: null,
    },
  };
};
