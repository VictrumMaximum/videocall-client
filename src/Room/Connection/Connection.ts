import { getOwnNickname } from "../Call/Call";
import { PeerConnections } from "./PeerConnection";
import { SocketConnection, SocketConnectionArgs } from "./WebSocket";

export interface ConnectionArgs {
  createRemoteVideoElement: (userId: string) => void;
  removeVideoElement: (userId: string) => void;
  roomId: string;
  updateConnectionStatus: (status: boolean) => void;
  log: loggerType;
  receiveMsg: (msg: string, sender: string) => void;
}

export enum Color {
  RED = "red",
  GREEN = "green",
  YELLOW = "yellow",
  CYAN = "cyan",
}

export enum ChatMessageType {
  SYSTEM = "system",
  RECIPIENT = "recipient",
  OWN = "own",
}

export interface SocketMessage {
  type: socketMessageType;
  source?: string; // source has ? because sometimes the server sends the client info, like the generated username
  target?: string; // target is not specified if the msg should be broadcast.
  payload?: any; // not always needed. Very often, the type, source and target are enough.
  candidate?: RTCIceCandidateInit; // for ice candidates
  sdp?: RTCSessionDescriptionInit;
  timer?: number;
  roomId?: string;
  nickname?: string;
}

type socketMessageType =
  | "media-offer"
  | "media-answer"
  | "new-ice-candidate"
  | "user-joined-room"
  | "register"
  | "disconnect"
  | "message"
  | "getRoomParticipants";

export type loggerType = (msg: string, color?: Color) => void;

export let localUserId: string;

export class Connection {
  private log;
  private ws;

  constructor(args: ConnectionArgs) {
    this.log = args.log;

    const peerConnections = new PeerConnections({
      sendToServer: this.sendToServer,
      log: this.log,
    });

    const socketConnection = new SocketConnection({
      ...args,
      peerConnections: peerConnections.state,
      createPeerConnection: peerConnections.createPeerConnection,
      sendToServer: this.sendToServer,
      setLocalUserId: (userId) => (localUserId = userId),
    });

    this.ws = socketConnection.ws;
  }

  sendToServer(msg: SocketMessage) {
    if (
      msg.type !== "new-ice-candidate" &&
      msg.type !== "message" &&
      msg.type !== "register"
    ) {
      this.log("Sending " + msg.type, Color.GREEN);
    }
    const nickname = getOwnNickname();
    this.ws.send(
      JSON.stringify({
        ...msg,
        source: localUserId,
        nickname,
      })
    );
  }
}
