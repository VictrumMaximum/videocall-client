import { createContext, useContext, useRef, useState } from "react";
import { ConnectingOverlay } from "./ConnectingOverlay/ConnectingOverlay";
import {
  useConnection,
  SocketMessage,
  socketMessageType,
  IConnectionContext,
} from "./Connection";

export const ConnectionContext = createContext({} as any);

interface ConnectionProviderProps {
  currentRoomId: string;
}

export const ConnectionProvider = ({
  children,
  currentRoomId,
}: React.PropsWithChildren<ConnectionProviderProps>) => {
  console.log("Render Connection Provider");
  const connection = useConnection();

  const { connected, initialized } = connection;

  return (
    <ConnectionContext.Provider value={connection}>
      {!connected && <ConnectingOverlay />}
      {children}
    </ConnectionContext.Provider>
  );
};

export const useSocket = () => {
  console.log("useSocket");
  const context = useContext<IConnectionContext>(ConnectionContext);
  return context.sendToServer;
};

export const useSocketListener = <T extends SocketMessage>(
  expectedMessageType?: socketMessageType
): T | null => {
  const context = useContext<IConnectionContext>(ConnectionContext);
  const lastMessageRef = useRef<T | null>(null);
  console.log("useSocket hook for messageType:", expectedMessageType);

  console.log(context);

  // TODO: how to know if it's a re-render because of new message, or because of re-render of calling component?

  if (
    expectedMessageType &&
    context.lastMessage &&
    context.lastMessage.type === expectedMessageType
  ) {
    console.log("update ref");
    lastMessageRef.current = context.lastMessage as T;
  }
  return lastMessageRef.current;
};

export const useMySocketListener = (expectedType: string) => {
  const context = useContext<IConnectionContext>(ConnectionContext);
  const lastValidMessage = useRef<SocketMessage | null>(null);
  if (context.lastMessage?.type === expectedType) {
    lastValidMessage.current = context.lastMessage;
  }
  return lastValidMessage.current;
};

// const createPeerConnection = (peers: PeersState, remoteUserId: string) => {
//   console.log("creating peer connection to", remoteUserId);

//   if (peers[remoteUserId]) {
//     return peers[remoteUserId].peerConnection;
//   }
//   console.log("Creating PeerConnection with user " + remoteUserId);
//   const myPeerConnection = new RTCPeerConnection({
//     iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//   });
//   // save reference to peer connection
//   peers[remoteUserId] = { peerConnection: myPeerConnection };

//   // first three of these event handlers are required
//   myPeerConnection.onicecandidate = (event) =>
//     handleICECandidateEvent(event, remoteUserId);
//   myPeerConnection.ontrack = (event) => handleTrackEvent(event, remoteUserId);
//   // onnegotiationneeded is not called in case of video-answer
//   myPeerConnection.onnegotiationneeded = () => {
//     handleNegotiationNeededEvent(myPeerConnection, remoteUserId);
//   };
//   // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
//   // myPeerConnection.onsignalingstatechange = () => handleSignalingStateChangeEvent(myPeerConnection);

//   // sendAudio(myPeerConnection);
//   // sendVideo(myPeerConnection);
//   // sendScreen(myPeerConnection);
//   return myPeerConnection;
// };

// const handleICECandidateEvent = (
//   event: any,
//   remoteUserId: string,
//   sendToServer: (msg: SocketMessage) => void
// ) => {
//   console.log("handle ICE candidate event");
//   if (event.candidate) {
//     // let others know of our candidate
//     sendToServer({
//       type: "new-ice-candidate",
//       target: remoteUserId,
//       candidate: event.candidate,
//     });
//   }
// };

// // called by RTCPeerConnection when remote user makes tracks available
// const handleTrackEvent = (event: any, remoteUserId: string) => {
//   const log = console.log;

//   log("handle track event");
//   const element: HTMLVideoElement = document.getElementById(
//     remoteUserId
//   ) as HTMLVideoElement;

//   if (this.state[remoteUserId].inBoundStream) {
//     log("Existing stream", Color.CYAN);
//     const stream: MediaStream = this.state[remoteUserId].inBoundStream!;
//     if (event.track.kind === "video") {
//       if (stream.getVideoTracks()[0]) {
//         stream.getVideoTracks()[0].stop();
//         stream.removeTrack(stream.getVideoTracks()[0]);
//       }
//       stream.addTrack(event.track);
//     }
//     if (event.track.kind === "audio") {
//       if (stream.getAudioTracks()[0]) {
//         stream.getAudioTracks()[0].stop();
//         stream.removeTrack(stream.getAudioTracks()[0]);
//       }
//       stream.addTrack(event.track);
//     }
//   } else {
//     log("New stream", Color.CYAN);
//     const stream = new MediaStream();
//     stream.addTrack(event.track);
//     this.state[remoteUserId].inBoundStream = stream;
//     element.srcObject = stream;
//   }
//   // if (event.streams[0]) {
//   //   if (event.streams[0].isActive === false) {
//   //     element.srcObject = null;
//   //   }
//   //   else {
//   //     element.srcObject = event.streams[0];
//   //   }
//   // }

//   // if (element.srcObject) {
//   //     console.log((element.srcObject as MediaStream).getTracks());
//   //     (element.srcObject as MediaStream).addTrack(event.track);
//   // } else {
//   //     element.srcObject = new MediaStream([event.track]);
//   // }
// };

// // called by RTCPeerconnection when a track is added or removed
// const handleNegotiationNeededEvent = (
//   myPeerConnection: RTCPeerConnection,
//   remoteUserId: string
// ) => {
//   console.log("handlenegotiationneeded");
//   myPeerConnection
//     .createOffer()
//     .then((offer) => {
//       return myPeerConnection.setLocalDescription(offer);
//     })
//     .then(() => {
//       this.sendToServer({
//         type: "media-offer",
//         target: remoteUserId,
//         sdp: myPeerConnection.localDescription!,
//       });
//     })
//     .catch(this.handleError);
// };

// const handleError = (e: any) => {
//   console.log(e);
// };
