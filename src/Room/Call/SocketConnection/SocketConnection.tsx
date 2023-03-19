import React, {
  createContext,
  Dispatch,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { SocketPublisher } from "./Publisher";
import {
  MessageToClientType,
  MessageToClientValues,
  MessageToServerValues,
} from "./SocketTypes";

export interface PeersState {
  [key: string]: {
    peerConnection: RTCPeerConnection;
    inBoundStream?: MediaStream;
    videoSender?: any;
  };
}

const hostName =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:9120"
    : `wss://${window.location.host}`;

const socketUrl = `${hostName}/videocall/socket`;

export type SendToServer = (msg: MessageToServerValues) => void;

export interface ISocketContext {
  isConnected: boolean;
  publisher: SocketPublisher;
  localUser: LocalUser;
  sendToServer: (msg: MessageToServerValues) => void;
}

const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);

  if (!context) {
    throw new Error("CallContext is not defined!");
  }

  return context;
};

type SocketProviderProps = {
  roomId: string;
  name: string | null;
};

type LocalUser = {
  id: string | null;
  name: string | null;
};

export const SocketProvider = ({
  children,
  name,
  roomId,
}: React.PropsWithChildren<SocketProviderProps>) => {
  const [isConnected, setIsConnected] = useState(false);
  const [localUser, setLocalUser] = useState<LocalUser>({
    id: null,
    name,
  });

  const socketConnectionRef = useRef<WebSocket | null>(null);
  const publisherRef = useRef(new SocketPublisher());
  const publisher = publisherRef.current;

  const connect = () => {
    console.log("Connecting websocket...");

    const ws = new WebSocket(socketUrl);

    socketConnectionRef.current = ws;

    ws.onopen = () => {
      console.log("WebSocket connected!");

      setIsConnected(true);

      // If this is the first time we connect, we expect a userId as response.
      // Otherwise, simply reconnect and continue using old userId.
      _sendToServer(ws, {
        type: "register",
        roomId,
        user: localUser,
      });

      ws.onmessage = (msg) =>
        processIncomingMessage(msg, ws, setLocalUser, publisher);

      ws.onclose = (event: CloseEvent) => {
        if (event.code === EXPLICIT_DISCONNECT_CODE) {
          console.log("WebSocket closed (explicit)");
          publisher.reset();
        } else {
          setIsConnected(false);

          // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
          console.error(`Unexpected websocket close, code ${event.code}`); // usual reason code: 1006

          // Reconnect
          connect();
        }
      };
    };
  };

  useEffect(() => {
    connect();
    return () => {
      socketConnectionRef.current?.close(EXPLICIT_DISCONNECT_CODE);
    };
  }, []);

  const sendToServer = useCallback((msg: MessageToServerValues) => {
    const ws = socketConnectionRef.current;

    if (!ws) {
      console.error(`Cannot send: socket not initialised`);
      return;
    }

    _sendToServer(ws, msg);
  }, []);

  const value = useMemo(
    () => ({ isConnected, publisher, localUser, sendToServer }),
    [isConnected, publisher, localUser, sendToServer]
  );

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

const _sendToServer = (ws: WebSocket, msg: MessageToServerValues) => {
  if (!isConnected(ws)) {
    console.error("WebSocket is not connected");
    return;
  }

  ws.send(JSON.stringify(msg));
};

const isConnected = (ws: WebSocket): boolean => {
  return ws.readyState === ws.OPEN;
};

const processIncomingMessage = (
  msg: MessageEvent<any>,
  ws: WebSocket,
  setLocalUser: Dispatch<SetStateAction<LocalUser>>,
  publisher: SocketPublisher
) => {
  const data: MessageToClientValues = JSON.parse(msg.data);

  logIncomingMessage(data);

  if (data.type === "ping") {
    return _sendToServer(ws, {
      type: "pong",
    });
  }

  if (data.type === "register") {
    const userId = data.userId;

    setLocalUser((localUser) => ({
      ...localUser,
      id: userId,
    }));

    for (const participant of data.usersInRoom) {
      publisher.emit({
        type: "user-joined-room",
        source: participant,
      });
    }
  }

  publisher.emit(data);
};

// https://www.iana.org/assignments/websocket/websocket.xhtml
const EXPLICIT_DISCONNECT_CODE = 1000; // Normal Closure

const logIncomingMessage = (msg: MessageToClientValues) => {
  const ignoredMessageTypes: MessageToClientType[] = [
    "new-ice-candidate",
    "chatMessage",
    "ping",
  ];

  if (!ignoredMessageTypes.includes(msg.type)) {
    console.log(msg);
  }
};
