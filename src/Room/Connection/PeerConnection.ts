// import { Color, loggerType, SocketMessage } from "./Connection";

// interface PeerConnectionHandlersArgs {
//   sendToServer: (msg: SocketMessage) => void;
//   log: loggerType;
// }

// export interface PeerConnectionsState {
//   [key: string]: {
//     peerConnection: RTCPeerConnection;
//     inBoundStream?: MediaStream;
//   };
// }

// export class PeerConnections {
//   private state: PeerConnectionsState;
//   private sendToServer: (msg: SocketMessage) => void;
//   private log: loggerType;

//   constructor(args: PeerConnectionHandlersArgs) {
//     this.state = {};
//     this.sendToServer = args.sendToServer;
//     this.log = args.log;
//   }

//   public getState() {
//     return this.state;
//   }

//   public createPeerConnection(remoteUserId: string) {
//     console.log("creating peer connection to", remoteUserId);
//     const state = this.state;
//     console.log(this.state);

//     if (state[remoteUserId]) {
//       return state[remoteUserId].peerConnection;
//     }
//     this.log("Creating PeerConnection with user " + remoteUserId);
//     const myPeerConnection = new RTCPeerConnection({
//       iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
//     });
//     // save reference to peer connection
//     state[remoteUserId] = { peerConnection: myPeerConnection };

//     // first three of these event handlers are required
//     myPeerConnection.onicecandidate = (event) =>
//       this.handleICECandidateEvent(event, remoteUserId);
//     myPeerConnection.ontrack = (event) =>
//       this.handleTrackEvent(event, remoteUserId);
//     // onnegotiationneeded is not called in case of video-answer
//     myPeerConnection.onnegotiationneeded = () => {
//       this.handleNegotiationNeededEvent(myPeerConnection, remoteUserId);
//     };
//     // myPeerConnection.onicegatheringstatechange = handleICEGatheringStateChangeEvent;
//     // myPeerConnection.onsignalingstatechange = () => handleSignalingStateChangeEvent(myPeerConnection);

//     // sendAudio(myPeerConnection);
//     // sendVideo(myPeerConnection);
//     // sendScreen(myPeerConnection);
//     return myPeerConnection;
//   }

//   // called by RTCPeerConnection when new ICE candidate is found for our network
//   private handleICECandidateEvent(event: any, remoteUserId: string) {
//     this.log("handle ICE candidate event");
//     if (event.candidate) {
//       // let others know of our candidate
//       this.sendToServer({
//         type: "new-ice-candidate",
//         target: remoteUserId,
//         candidate: event.candidate,
//       });
//     }
//   }

//   // called by RTCPeerConnection when remote user makes tracks available
//   private handleTrackEvent(event: any, remoteUserId: string) {
//     const log = this.log;

//     log("handle track event");
//     const element: HTMLVideoElement = document.getElementById(
//       remoteUserId
//     ) as HTMLVideoElement;

//     if (this.state[remoteUserId].inBoundStream) {
//       log("Existing stream", Color.CYAN);
//       const stream: MediaStream = this.state[remoteUserId].inBoundStream!;
//       if (event.track.kind === "video") {
//         if (stream.getVideoTracks()[0]) {
//           stream.getVideoTracks()[0].stop();
//           stream.removeTrack(stream.getVideoTracks()[0]);
//         }
//         stream.addTrack(event.track);
//       }
//       if (event.track.kind === "audio") {
//         if (stream.getAudioTracks()[0]) {
//           stream.getAudioTracks()[0].stop();
//           stream.removeTrack(stream.getAudioTracks()[0]);
//         }
//         stream.addTrack(event.track);
//       }
//     } else {
//       log("New stream", Color.CYAN);
//       const stream = new MediaStream();
//       stream.addTrack(event.track);
//       this.state[remoteUserId].inBoundStream = stream;
//       element.srcObject = stream;
//     }
//     // if (event.streams[0]) {
//     //   if (event.streams[0].isActive === false) {
//     //     element.srcObject = null;
//     //   }
//     //   else {
//     //     element.srcObject = event.streams[0];
//     //   }
//     // }

//     // if (element.srcObject) {
//     //     console.log((element.srcObject as MediaStream).getTracks());
//     //     (element.srcObject as MediaStream).addTrack(event.track);
//     // } else {
//     //     element.srcObject = new MediaStream([event.track]);
//     // }
//   }

//   // called by RTCPeerconnection when a track is added or removed
//   private handleNegotiationNeededEvent(
//     myPeerConnection: RTCPeerConnection,
//     remoteUserId: string
//   ) {
//     this.log("handlenegotiationneeded");
//     myPeerConnection
//       .createOffer()
//       .then((offer) => {
//         return myPeerConnection.setLocalDescription(offer);
//       })
//       .then(() => {
//         this.sendToServer({
//           type: "media-offer",
//           target: remoteUserId,
//           sdp: myPeerConnection.localDescription!,
//         });
//       })
//       .catch(this.handleError);
//   }

//   private handleError(e: any) {
//     this.log(e, Color.RED);
//   }
// }

// // remoteUserId not supplied in case of creating peer connection as answer to a video offer

// /******************** RTCPEERCONNECTION EVENT HANDLERS ***************************/

// /************** SIGNALLING EVENT HANDLERS ************************/
// // export function handleGetRoomParticipants(participants: string[]) {
// //   log("Received participants: " + participants);
// //   participants.forEach((userId) => createPeerConnection(userId));
// // }

// // export function handleMediaOffer(msg: Message) {
// //   let myPeerConnection = peerConnections[msg.source];
// //   if (myPeerConnection == null) {
// //     log("Creating peer connection after receiving media offer");
// //     myPeerConnection = createPeerConnection(msg.source);
// //   }
// //   console.log(msg.sdp);
// //   myPeerConnection
// //     .setRemoteDescription(new RTCSessionDescription(msg.sdp))
// //     .then(() => {
// //       return myPeerConnection.createAnswer();
// //     })
// //     .then((answer) => {
// //       return myPeerConnection.setLocalDescription(answer);
// //     })
// //     .then(() => {
// //       sendToServer({
// //         type: "media-answer",
// //         target: msg.source,
// //         sdp: myPeerConnection.localDescription,
// //       });
// //     })
// //     // TODO: revert this catch block once you've figured out why the sdp error occurs
// //     .catch((error) => {
// //       log(msg.sdp.sdp); // Failed to set remote video description send parameters for m-section with mid='0'});
// //       handleError(error);
// //     });
// //   createRemoteVideoElement(msg.source);
// // }

// // export function handleMediaAnswer(msg: Message) {
// //   peerConnections[msg.source].setRemoteDescription(
// //     new RTCSessionDescription(msg.sdp)
// //   );
// //   createRemoteVideoElement(msg.source);

// //   // Send media tracks if available. This may trigger negotiation again
// //   // sendAudio(peerConnections[msg.source]);
// //   // sendVideo(peerConnections[msg.source]);
// //   // sendScreen(peerConnections[msg.source]);
// // }

export const a = 1;
