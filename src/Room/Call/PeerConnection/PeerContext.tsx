import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useStreams } from "../MediaStreams/StreamProvider";
import { SendToServer, useSocket } from "../SocketConnection/SocketConnection";
import {
  MessagesToClient,
  SocketUser,
  StreamContentMap,
} from "../SocketConnection/SocketTypes";
import { handleNewICECandidateMsg } from "./handlers/ICE";
import { handleMediaAnswer, handleMediaOffer } from "./handlers/Negotiation";
import { manageTrack, StreamContent } from "./handlers/TrackManagement";
import {
  handleUserJoinedRoom,
  handleUserLeftRoom,
} from "./handlers/UserJoinLeave";

export interface Peer {
  user: SocketUser;
  peerConnection: RTCPeerConnection;
  streamContentMap: StreamContentMap;
  streams: {
    [content in StreamContent]: MediaStream | null;
  };
  senders: {
    camSender: RTCRtpSender | null;
    micSender: RTCRtpSender | null;
    screenVideoSender: RTCRtpSender | null;
    screenAudioSender: RTCRtpSender | null;
  };
}

export interface Peers {
  [remoteUserId: string]: Peer;
}

export type SetPeers = React.Dispatch<React.SetStateAction<Peers>>;
export type WithPeers = { peers: Peers };
export type WithSetPeers = { setPeers: SetPeers };

export type WithSendToServer = { sendToServer: SendToServer };

export type WithUserId = { remoteUserId: string };
export type WithUser = { user: SocketUser };

export type WithStream = { stream: MediaStream };

export type WithMessage<T extends keyof MessagesToClient> = {
  msg: MessagesToClient[T];
};

export interface IPeersContext {
  peers: Peers;
}

const PeersContext = createContext<IPeersContext | null>(null);

export const PeersProvider: React.FC = ({ children }) => {
  const [peers, setPeers] = useState<IPeersContext["peers"]>({});
  const { socketConnection } = useSocket();
  const { camTrack, micTrack, screenVideoTrack } = useStreams();

  // Subscribe to socket messages with the appropriate handlers.
  // Unsubscribe and resubscribe when the useEffect dependencies are updated.
  const subsRef = useRef<number[]>([]);
  useEffect(() => {
    const socketPublisher = socketConnection.getPublisher();
    const args = {
      peers,
      setPeers,
      sendToServer: socketConnection.sendToServer,
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
  }, [socketConnection, peers]);

  useEffect(() => {
    manageTrack({
      streamLabel: "user",
      track: camTrack,
      senderType: "camSender",
      peers,
    });
    manageTrack({
      streamLabel: "user",
      track: micTrack,
      senderType: "micSender",
      peers,
    });
    manageTrack({
      streamLabel: "screen",
      track: screenVideoTrack,
      senderType: "screenVideoSender",
      peers,
    });
    // manageTrack({
    //   streamLabel: "user",
    //   track: screenAudioTrack,
    //   senderType: 'screenAudioSender',
    //   peers,
    // });
  }, [camTrack, micTrack, screenVideoTrack, peers]);

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
          peer.peerConnection.close();
        });
      }
    },
    [peers]
  );

  return (
    <PeersContext.Provider value={{ peers }}>{children}</PeersContext.Provider>
  );
};

export const usePeers = () => {
  const context = useContext(PeersContext);

  if (!context) {
    throw new Error("PeersContext not defined!");
  }

  return context;
};
