import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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

export type SendToServer = (msg: MessageToServerValues) => void;

// TODO: rewrite this to a context + hook

class SocketConnection {
  private roomId: string;

  // TODO: put localUserId and nickname in a User type?
  private localUser: Omit<SocketUser, 'id'> & { id?: string };

  private socketPublisher: SocketPublisher;
  private ws: WebSocket;

  private setIsConnected: (isConnected: boolean) => void;

  // https://www.iana.org/assignments/websocket/websocket.xhtml
  private readonly EXPLICIT_DISCONNECT_CODE = 1000; // Normal Closure

  constructor(roomId: string, setIsConnected: (isConnected: boolean) => void) {
    this.roomId = roomId;
    this.setIsConnected = setIsConnected;

    this.socketPublisher = new SocketPublisher();
    this.ws = this.connect();

    this.localUser = {
      name: getOwnNickname() ?? undefined,
    };

    this.sendToServer = this.sendToServer.bind(this);
    this.processIncomingMessage = this.processIncomingMessage.bind(this);
    this.handleOnClose = this.handleOnClose.bind(this);
  }

  private connect() {
    if (this.isConnected()) {
      console.warn('Cannot connect: Already connected');
      return this.ws;
    }

    const ws = new WebSocket(socketUrl);

    ws.onopen = () => {
      console.log('WebSocket connected!');

      this.setIsConnected(true);

      // If this is the first time we connect, we expect a userId as response.
      // Otherwise, simply reconnect and continue using old userId.
      this.sendToServer({
        type: 'register',
        roomId: this.roomId,
        name: this.localUser.name,
      });

      ws.onmessage = this.processIncomingMessage;
      ws.onclose = this.handleOnClose;
    };

    return ws;
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
        this.socketPublisher.emit({
          type: 'user-joined-room',
          source: participant,
        });
      }
    }

    this.socketPublisher.emit(data);
  }

  public sendToServer: SendToServer = (msg) => {
    if (!this.isConnected()) {
      console.error('WebSocket is not connected');
      return;
    }

    this.ws.send(JSON.stringify(msg));
  };

  private handleOnClose(event: CloseEvent) {
    this.setIsConnected(false);

    if (event.code === this.EXPLICIT_DISCONNECT_CODE) {
      console.log('WebSocket closed (explicit)');
      this.tearDown();
    } else {
      // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
      console.error(`Unexpected websocket close, code ${event.code}`); // usual reason code: 1006

      // Reconnect
      this.connect();
    }
  }

  public disconnect() {
    if (this.isConnected()) {
      console.log('Disconnecting...');
      this.ws.close(this.EXPLICIT_DISCONNECT_CODE);
    }
  }

  private tearDown() {
    // Not sure if this is good practice, but we need to somehow ensure that
    // a new connection is created each time you leave and enter a room.
    instance = null;

    this.getPublisher().reset();
  }

  private isConnected() {
    return this.ws && this.ws.readyState === this.ws.OPEN;
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

let instance: SocketConnection | null = null;

const initSocketConnection = (
  roomId: string,
  setIsConnected: (isConnected: boolean) => void
) => {
  if (!instance) {
    instance = new SocketConnection(roomId, setIsConnected);
  }

  return instance;
};

export interface ISocketContext {
  socketConnection: SocketConnection;
  isConnected: boolean;
}

const SocketContext = createContext<ISocketContext | null>(null);

type SocketProviderProps = {
  roomId: string;
};

export const SocketProvider = ({
  children,
  roomId,
}: React.PropsWithChildren<SocketProviderProps>) => {
  const [isConnected, setIsConnected] = useState(false);
  const socketConnection = useRef(initSocketConnection(roomId, setIsConnected));

  const value = useMemo(
    () => ({ socketConnection: socketConnection.current, isConnected }),
    [isConnected]
  );

  useEffect(() => () => socketConnection.current.disconnect(), []);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error('CallContext is not defined!');
  }

  return context;
};
