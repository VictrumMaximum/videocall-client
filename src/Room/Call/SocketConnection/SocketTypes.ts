export type SocketUser = {
  id: string;
  name?: string;
};

// ******************** INCOMING ***********************

type WithSource = {
  source: SocketUser;
};

export type StreamContentMap = {
  [streamId: string]: "user" | "screen";
};

export interface MessagesToClient {
  register: {
    type: "register";
    userId: string;
    usersInRoom: SocketUser[];
  };
  chatMessage: {
    type: "chatMessage";
    text: string;
  } & WithSource;
  "new-ice-candidate": {
    type: "new-ice-candidate";
    candidate: RTCIceCandidate;
  } & WithSource;
  "user-left-room": {
    type: "user-left-room";
  } & WithSource;
  "user-joined-room": {
    type: "user-joined-room";
  } & WithSource;
  "media-offer": {
    type: "media-offer";
    sdp: RTCSessionDescription;
    streamContentMap: StreamContentMap;
  } & WithSource;
  "media-answer": {
    type: "media-answer";
    sdp: RTCSessionDescription;
    streamContentMap: StreamContentMap;
  } & WithSource;
}

// This type enforces every message type to contain a "type" field.
export type MessageToClientType =
  MessagesToClient[keyof MessagesToClient]["type"];
// This type enforces every key to match its "type" field.
export type MessageToClientValues = MessagesToClient[MessageToClientType];

// ******************** OUTGOING ***********************

export interface MessagesToServer extends RelayMessages {
  register: {
    type: "register";
    roomId: string;
    name?: string;
  };
  chatMessage: {
    type: "chatMessage";
    text: string;
  };
}

type WithDestination = {
  target: string;
};

export interface RelayMessages {
  "new-ice-candidate": {
    type: "new-ice-candidate";
    candidate: RTCIceCandidate;
  } & WithDestination;
  "media-offer": {
    type: "media-offer";
    sdp: RTCSessionDescription;
    streamContentMap: StreamContentMap;
  } & WithDestination;
  "media-answer": {
    type: "media-answer";
    sdp: RTCSessionDescription;
    streamContentMap: StreamContentMap;
  } & WithDestination;
}

// This type enforces every message type to contain a "type" field.
export type MessageToServerType =
  MessagesToServer[keyof MessagesToServer]["type"];
// This type enforces every key to match its "type" field.
export type MessageToServerValues = MessagesToServer[MessageToServerType];
