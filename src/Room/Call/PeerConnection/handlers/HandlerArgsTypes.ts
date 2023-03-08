import { SendToServer } from "../../SocketConnection/SocketConnection";
import {
  MessagesToClient,
  StreamType,
} from "../../SocketConnection/SocketTypes";
import { Peers } from "../PeerContext";

export type SetPeers = React.Dispatch<React.SetStateAction<Peers>>;
export type WithPeers = { peers: Peers };
export type WithSetPeers = { setPeers: SetPeers };

export type WithSendToServer = { sendToServer: SendToServer };

export type WithUserId = { remoteUserId: string };

export type WithStream = { stream: MediaStream };

export type WithMessage<T extends keyof MessagesToClient> = {
  msg: MessagesToClient[T];
};

export type WithStreamType = { streamType: StreamType };
