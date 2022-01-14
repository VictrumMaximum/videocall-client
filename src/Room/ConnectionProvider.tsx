import { createContext, useContext, useEffect, useRef, useState } from "react";

type socketMessageType =
  | "media-offer"
  | "media-answer"
  | "new-ice-candidate"
  | "user-joined-room"
  | "register"
  | "disconnect"
  | "message"
  | "getRoomParticipants";

export const ConnectionContext = createContext({} as any);

const hostName =
  process.env.NODE_ENV === "development"
    ? "ws://localhost:9120"
    : `wss://${window.location.host}`;

const socketUrl = `${hostName}/videocall/socket`;

interface ConnectionProviderProps {
  roomId: string;
}

interface SocketMessage {
  type: socketMessageType;
  [key: string]: any;
}

interface IConnectionContext {
  webSocket: WebSocket | null;
  connected: boolean;
  lastMessage: SocketMessage | null;
  sendToServer: (msg: SocketMessage) => void;
  roomId: string;
  nickname: string | null;
  localUserId: string | null;
}

const getOwnNickname = () => {
  return window.localStorage.getItem("nickname");
};

export const ConnectionProvider = ({
  children,
  roomId,
}: React.PropsWithChildren<ConnectionProviderProps>) => {
  console.log("Render Connection Provider");
  const wsRef = useRef<WebSocket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<SocketMessage | null>(null);
  const [localUserId, setLocalUserId] = useState(null);
  const nicknameRef = useRef(getOwnNickname());

  // TODO: useCallback?
  const sendToServer = (msg: SocketMessage) => {
    const webSocket = wsRef.current;

    // Do not attempt to send without a userId
    if (webSocket && (localUserId || msg.type === "register")) {
      webSocket.send(
        JSON.stringify({
          ...msg,
          source: localUserId,
          nickname: nicknameRef.current,
        })
      );
    } else {
      console.log("Cannot send message without localUserId");
    }
  };

  useEffect(() => {
    console.log("Use Effect context provider");
    if (connected) {
      console.log(`Already connected, so don't init`);
      return;
    }

    wsRef.current = new WebSocket(socketUrl);
    const webSocket = wsRef.current;

    webSocket.onopen = () => {
      console.log("WebSocket connected!");
      setConnected(true);

      // If this is the first time we connect, we expect a userId as response.
      // Otherwise, simply reconnect and continue using old userId.
      sendToServer({ type: "register", roomId });

      webSocket.onmessage = (msg) => {
        const data: SocketMessage = JSON.parse(msg.data);
        if (data.type != "new-ice-candidate") {
          console.log("received message:");
          console.log(data);
        }
        switch (data.type) {
          case "register":
            setLocalUserId(data.payload);
            // TODO: sendToServer(getRoomParticipants)
            break;
          default:
            setLastMessage(data);
            break;
        }
      };

      webSocket.onclose = (event) => {
        console.log("WebSocket closed");
        // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
        console.log(event); // usual reason code: 1006

        setConnected(false);
      };
    };
    return () => {
      if (webSocket.readyState === webSocket.OPEN || webSocket.CONNECTING) {
        webSocket.close();
      }
    };
  }, [connected]);

  const connectionState: IConnectionContext = {
    webSocket: wsRef.current,
    connected,
    lastMessage,
    sendToServer,
    nickname: nicknameRef.current,
    roomId,
    localUserId,
  };

  return (
    <ConnectionContext.Provider value={connectionState}>
      {children}
    </ConnectionContext.Provider>
  );
};

export const useSocket = <T extends SocketMessage>(
  expectedMessageType?: socketMessageType
): IConnectionContext & { lastMessage: T | null } => {
  const context = useContext<IConnectionContext>(ConnectionContext);
  // TODO: put local last message in a state?
  // so that if a new unrelated message pops up, we do not go back to null?

  let lastMessage: T | null = null;

  if (
    expectedMessageType &&
    context.lastMessage &&
    context.lastMessage.type === expectedMessageType
  ) {
    lastMessage = context.lastMessage as T;
  }
  return {
    ...context,
    lastMessage,
  };
};
