import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { createRemoteVideo } from '../Chat/RemoteVideos/RemoteVideos';
import { RegisterPayload } from './PayloadTypes';
import { SocketPublisher } from './Publisher';
import {
  MessageToClientValues,
  MessageToServerValues,
  SocketUser,
} from './SocketTypes';
// import { createPeerConnection, handleMediaOffer } from "./PeerConnection";

// export type socketMessageType =
//   | 'media-offer'
//   | 'media-answer'
//   | 'new-ice-candidate'
//   | 'user-joined-room'
//   | 'register'
//   | 'disconnect'
//   | 'chatMessage'
//   | 'getRoomParticipants';

// export interface SocketMessage {
//   type: socketMessageType;
//   [key: string]: any;
// }

export interface PeersState {
  [key: string]: {
    peerConnection: RTCPeerConnection;
    inBoundStream?: MediaStream;
    videoSender?: any;
  };
}

const getOwnNickname = () => {
  return window.localStorage.getItem('nickname');
};

const hostName =
  process.env.NODE_ENV === 'development'
    ? 'ws://localhost:9120'
    : `wss://${window.location.host}`;

const socketUrl = `${hostName}/videocall/socket`;

class Connection {
  private roomId: string | null;
  private connected: boolean;

  // TODO: put localUserId and nickname in a User type?
  private localUser: Omit<SocketUser, 'id'> & { id?: string };
  // private localUserId: string | null;
  // private nickname: string | null;

  private socketPublisher: SocketPublisher;
  private ws: WebSocket | null;

  // https://www.iana.org/assignments/websocket/websocket.xhtml
  private readonly EXPLICIT_DISCONNECT_CODE = 1000; // Normal Closure

  constructor() {
    this.ws = null;
    this.roomId = null;
    this.localUser = {
      name: getOwnNickname() || undefined,
    };
    this.connected = false;

    this.socketPublisher = new SocketPublisher();

    this.processIncomingMessage = this.processIncomingMessage.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
  }

  public connect(roomId: string) {
    if (this.isOpen(this.ws)) {
      console.warn('Close the current connection before starting a new one');
      return;
    }

    this.roomId = roomId;

    const ws = new WebSocket(socketUrl);
    this.ws = ws;

    ws.onopen = () => {
      console.log('WebSocket connected!');

      this.connected = true;

      // If this is the first time we connect, we expect a userId as response.
      // Otherwise, simply reconnect and continue using old userId.
      this.sendToServer({
        type: 'register',
        roomId,
        name: this.localUser.name,
      });

      ws.onmessage = this.processIncomingMessage;
      ws.onclose = this.handleOnClose;
    };
  }

  private processIncomingMessage(msg: MessageEvent<any>) {
    const data: MessageToClientValues = JSON.parse(msg.data);

    if (data.type !== 'new-ice-candidate') {
      console.log('received message:');
      console.log(data);
    }

    switch (data.type) {
      case 'register':
        const userId = data.userId;

        console.log(this.localUser);
        // continue using old id in case of reconnect

        this.localUser.id = userId || this.localUser.id;
        // for (const otherUser of roomParticipants) {
        //   createPeerConnection(otherUser.id);
        // }
        break;
      // case 'user-joined-room':
      //   // createPeerConnection(data.source);
      //   break;
      // case 'media-offer':
      //   // handleMediaOffer(data);
      //   break;
      // case 'media-answer':
      //   // handleMediaAnswer(data);
      //   break;
      // case 'new-ice-candidate':
      //   // handleNewICECandidateMsg(data);
      //   break;
      default:
        // Do nothing here, just let the publisher emit the message.
        break;
    }

    this.socketPublisher.emit(data);
  }

  private handleOnClose(event: CloseEvent) {
    console.log('WebSocket closed');
    if (event.code === this.EXPLICIT_DISCONNECT_CODE) {
      this.connected = false;
      this.ws = null;
    } else {
      // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
      console.error(`UNEXPECTED WEBSOCKET CLOSED, code ${event.code}`); // usual reason code: 1006

      // TODO: reconnect!!!!
    }
  }

  public disconnect() {
    if (this.isOpen(this.ws)) {
      console.log('Disconnecting...');
      this.ws.close(this.EXPLICIT_DISCONNECT_CODE);
    }
  }

  public sendToServer(msg: MessageToServerValues) {
    if (!this.isOpen(this.ws)) {
      console.error('WebSocket is not connected');
      return;
    }

    this.ws.send(JSON.stringify(msg));
  }

  private isOpen(ws: WebSocket | null): ws is WebSocket {
    return !!ws && ws.readyState === ws.OPEN;
  }

  public getPublisher() {
    return this.socketPublisher;
  }

  public getLocalUserName() {
    return this.localUser.name;
  }

  public getLocalUserId() {
    return this.localUser.id;
  }
}

let instance: Connection | null = null;

export const getConnection = () => {
  if (!instance) {
    instance = new Connection();
  }
  return instance;
};

// export const useConnection = (): IConnectionContext => {
//   console.log('useConnection');
//   const params = useParams();
//   const roomId = params.roomId;

//   // const [peers, setPeers] = useState<PeersState>({});
//   const nicknameRef = useRef<string | null>(null);
//   const wsRef = useRef<WebSocket | null>(null);
//   const [localUserId, setLocalUserId] = useState<string | null>(null);

//   const [connected, setConnected] = useState(false);
//   const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);

//   const sendToServer = useCallback((msg: SocketMessage) => {
//     const ws = wsRef.current;

//     if (!ws) {
//       console.error('WebSocket not initialized');
//       return;
//     }
//     ws.send(JSON.stringify(msg));
//   }, []);

//   const nickname = nicknameRef.current;

//   useEffect(() => {
//     wsRef.current = new WebSocket(socketUrl);
//     nicknameRef.current = getOwnNickname();
//   }, []);

//   useEffect(() => {
//     const ws = wsRef.current;
//     if (!ws) {
//       return;
//     }

//     ws.onopen = () => {
//       console.log('WebSocket connected!');

//       setConnected(true);

//       // If this is the first time we connect, we expect a userId as response.
//       // Otherwise, simply reconnect and continue using old userId.
//       sendToServer({ type: 'register', roomId });

//       ws.onmessage = (msg) => {
//         const data: SocketMessage = JSON.parse(msg.data);
//         if (data.type !== 'new-ice-candidate') {
//           console.log('received message:');
//           console.log(data);
//         }
//         switch (data.type) {
//           case 'register':
//             const userId = data.userId;
//             setLocalUserId(userId || localUserId); // continue using old id in case of reconnect
//             // for (const otherUser of roomParticipants) {
//             //   createPeerConnection(otherUser.id);
//             // }
//             break;
//           case 'user-joined-room':
//             // createPeerConnection(data.source);
//             break;
//           case 'media-offer':
//             // handleMediaOffer(data);
//             break;
//           case 'media-answer':
//             // handleMediaAnswer(data);
//             break;
//           case 'new-ice-candidate':
//             // handleNewICECandidateMsg(data);
//             break;
//           default:
//             setLastMessage(data);
//             break;
//         }
//       };

//       ws.onclose = (event) => {
//         console.log('WebSocket closed');
//         // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
//         console.log(event); // usual reason code: 1006

//         setConnected(false);
//       };
//     };
//   }, [roomId, sendToServer]);

//   return {
//     localUserId,
//     sendToServer,
//     nickname,
//     // ws: wsRef.current,
//     // peers,
//     connected,
//     lastMessage,
//     initialized: !!localUserId,
//   };
// };

// export interface IConnectionContext {
//   localUserId: string | null;
//   nickname: string | null;
//   // ws: WebSocket | null;
//   initialized: boolean;
//   // peers: PeersState;
//   sendToServer: (msg: SocketMessage) => void;
//   connected: boolean;
//   lastMessage: SocketMessage | null;
// }

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
