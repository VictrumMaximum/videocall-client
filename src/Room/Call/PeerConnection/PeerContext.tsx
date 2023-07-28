import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStreams } from "../MediaStreams/StreamProvider";
import { useSocket } from "../SocketConnection/SocketConnection";
import { SocketUser, StreamType } from "../SocketConnection/SocketTypes";
import { handleNewICECandidateMsg } from "./handlers/ICE";
import { handleMediaAnswer, handleMediaOffer } from "./handlers/Negotiation";
import { manageStream, manageTrack } from "./handlers/TrackManagement";
import {
  handleUserJoinedRoom,
  handleUserLeftRoom,
} from "./handlers/UserJoinLeave";

export const PeersProvider: React.FC = ({ children }) => {
  const [peers, setPeers] = useState<Peers>({});
  const { publisher: socketPublisher, sendToServer } = useSocket();
  const { camera, microphone, screen } = useStreams();

  // Subscribe to socket messages with the appropriate handlers.
  // Unsubscribe and resubscribe when the useEffect dependencies are updated.
  const subsRef = useRef<number[]>([]);
  useEffect(() => {
    const args = {
      peers,
      setPeers,
      sendToServer,
    };

    subsRef.current = [
      socketPublisher.subscribe("media-offer", (msg) =>
        handleMediaOffer({ msg, ...args })
      ),
      socketPublisher.subscribe("media-answer", (msg) =>
        handleMediaAnswer({ msg, ...args })
      ),
      socketPublisher.subscribe("new-ice-candidate", (msg) =>
        handleNewICECandidateMsg({ msg, ...args })
      ),
      socketPublisher.subscribe("user-joined-room", (msg) =>
        handleUserJoinedRoom({ msg, ...args })
      ),
      socketPublisher.subscribe("user-left-room", (msg) =>
        handleUserLeftRoom({ msg, ...args })
      ),
    ];

    return () => {
      subsRef.current.forEach((id) => socketPublisher.unsubscribe(id));
    };
  }, [socketPublisher, sendToServer, peers]);

  // Manage outgoing media tracks
  useEffect(() => {
    manageTrack({
      streamType: "camera",
      track: camera.track || null,
      senderType: "video",
      peers,
    });
    manageTrack({
      streamType: "camera",
      track: microphone.track || null,
      senderType: "audio",
      peers,
    });
    manageStream({
      streamType: "screen",
      stream: screen.stream,
      peers,
    });
  }, [camera, microphone, screen, peers]);

  // =========== Unmounting stuff ======================
  const unmountingRef = useRef(false);
  useEffect(
    () => () => {
      unmountingRef.current = true;
    },
    []
  );
  useEffect(
    () => () => {
      if (unmountingRef.current) {
        Object.values(peers).forEach((peer) => {
          Object.values(peer.connections).forEach((connection) => {
            connection.peerConnection.close();
          });
        });
      }
    },
    [peers]
  );
  // =========== /Unmounting stuff ======================

  return (
    <PeersContext.Provider value={{ peers: Object.values(peers) }}>
      {children}
    </PeersContext.Provider>
  );
};

const PeersContext = createContext<IPeersContext | null>(null);

export const usePeers = () => {
  const context = useContext(PeersContext);

  if (!context) {
    throw new Error("PeersContext not defined!");
  }

  return context;
};

export interface Peers {
  [remoteUserId: string]: Peer;
}

export interface Peer {
  user: SocketUser;
  connections: Record<StreamType, Connection>;
}

export interface Connection {
  peerConnection: RTCPeerConnection;
  incomingStream: MediaStream | null;
  isSharingVideo: boolean;
  dataChannel: RTCDataChannel | null;
  senders: {
    video: RTCRtpSender | null;
    audio: RTCRtpSender | null;
  };
}

export interface IPeersContext {
  peers: Peer[];
}
