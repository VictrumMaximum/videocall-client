import { PeerConnectionManager } from './PeerConnection';
import { SocketPublisher } from './Publisher';
import {
  MessageToClientValues,
  MessageToServerValues,
  SocketUser,
} from './SocketTypes';

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
  private peerConnectionManager: PeerConnectionManager;
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
    this.sendToServer = this.sendToServer.bind(this);
    this.peerConnectionManager = new PeerConnectionManager(
      this.socketPublisher,
      this.sendToServer
    );

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

    if (data.type === 'register') {
      const userId = data.userId;

      // continue using old id in case of reconnect
      this.localUser.id = userId || this.localUser.id;

      for (const participant of data.usersInRoom) {
        this.getPublisher().emit({
          type: 'user-joined-room',
          source: participant,
        });
      }
    }

    this.socketPublisher.emit(data);
  }

  private handleOnClose(event: CloseEvent) {
    console.log('WebSocket closed');
    if (event.code === this.EXPLICIT_DISCONNECT_CODE) {
      this.connected = false;
      this.ws = null;
      this.tearDown();
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
      this.tearDown();
    }
  }

  private tearDown() {
    // Not sure if this is good practice, but we need to somehow ensure that
    // a new connection is created each time you leave and enter a room.
    instance = null;

    this.getPeerConnectionManager().reset();
    this.getPublisher().reset();
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

  public getPeerConnectionManager() {
    return this.peerConnectionManager;
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
