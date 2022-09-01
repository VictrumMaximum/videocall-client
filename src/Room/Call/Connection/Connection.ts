import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { createRemoteVideo } from "../Chat/RemoteVideos/RemoteVideos";
import { RegisterPayload } from "./PayloadTypes";
// import { createPeerConnection, handleMediaOffer } from "./PeerConnection";

export type socketMessageType =
  | "media-offer"
  | "media-answer"
  | "new-ice-candidate"
  | "user-joined-room"
  | "register"
  | "disconnect"
  | "chatMessage"
  | "getRoomParticipants";

export interface SocketMessage {
  type: socketMessageType;
  [key: string]: any;
}

export interface PeersState {
  [key: string]: {
    peerConnection: RTCPeerConnection;
    inBoundStream?: MediaStream;
    videoSender?: any;
  };
}

const getOwnNickname = () => {
  return window.localStorage.getItem("nickname");
};

const hostName =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:9120"
    : `wss://${window.location.host}`;

const socketUrl = `${hostName}/videocall/socket`;

export const useConnection = (): IConnectionContext => {
  console.log("useConnection");
  const params = useParams();
  const roomId = params.roomId;

  // const [peers, setPeers] = useState<PeersState>({});
  const nicknameRef = useRef<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const [localUserId, setLocalUserId] = useState<string | null>(null);

  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);

  const sendToServer = useCallback((msg: SocketMessage) => {
    const ws = wsRef.current;

    if (!ws) {
      console.error("WebSocket not initialized");
      return;
    }
    ws.send(JSON.stringify(msg));
  }, []);

  const nickname = nicknameRef.current;

  useEffect(() => {
    wsRef.current = new WebSocket(socketUrl);
    nicknameRef.current = getOwnNickname();
  }, []);

  useEffect(() => {
    const ws = wsRef.current;
    if (!ws) {
      return;
    }

    ws.onopen = () => {
      console.log("WebSocket connected!");

      setConnected(true);

      // If this is the first time we connect, we expect a userId as response.
      // Otherwise, simply reconnect and continue using old userId.
      sendToServer({ type: "register", roomId });

      ws.onmessage = (msg) => {
        const data: SocketMessage = JSON.parse(msg.data);
        if (data.type !== "new-ice-candidate") {
          console.log("received message:");
          console.log(data);
        }
        switch (data.type) {
          case "register":
            const userId = data.userId;
            setLocalUserId(userId || localUserId); // continue using old id in case of reconnect
            // for (const otherUser of roomParticipants) {
            //   createPeerConnection(otherUser.id);
            // }
            break;
          case "user-joined-room":
            // createPeerConnection(data.source);
            break;
          case "media-offer":
            // handleMediaOffer(data);
            break;
          case "media-answer":
            // handleMediaAnswer(data);
            break;
          case "new-ice-candidate":
            // handleNewICECandidateMsg(data);
            break;
          default:
            setLastMessage(data);
            break;
        }
      };

      ws.onclose = (event) => {
        console.log("WebSocket closed");
        // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
        console.log(event); // usual reason code: 1006

        setConnected(false);
      };
    };
  }, [roomId, sendToServer]);

  return {
    localUserId,
    sendToServer,
    nickname,
    // ws: wsRef.current,
    // peers,
    connected,
    lastMessage,
    initialized: !!localUserId,
  };
};

export interface IConnectionContext {
  localUserId: string | null;
  nickname: string | null;
  // ws: WebSocket | null;
  initialized: boolean;
  // peers: PeersState;
  sendToServer: (msg: SocketMessage) => void;
  connected: boolean;
  lastMessage: SocketMessage | null;
}

// function handleMediaAnswer(data: SocketMessage) {
//   peers[data.source].peerConnection.setRemoteDescription(
//     new RTCSessionDescription(data.sdp)
//   );
//   createRemoteVideo(data.source, data.nickname);
// }

// // event handler for when remote user makes a potential ICE candidate known for his network
// export function handleNewICECandidateMsg(msg: SocketMessage) {
//   if (peers[msg.source]) {
//     peers[msg.source].peerConnection
//       .addIceCandidate(new RTCIceCandidate(msg.candidate))
//       .catch(console.error);
//   }
// }
