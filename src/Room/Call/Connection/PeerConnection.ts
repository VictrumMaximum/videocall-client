// import { addTrack, createRemoteVideo } from "../Chat/RemoteVideos/RemoteVideos";

// export const createPeerConnection = (remoteUserId: string) => {
//   if (peers[remoteUserId]) {
//     console.warn(`peer connection with ${remoteUserId} already exists!`);
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

// // called by RTCPeerConnection when new ICE candidate is found for our network
// const handleICECandidateEvent = (event: any, remoteUserId: string) => {
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
// const handleTrackEvent = (
//   event: MediaStreamTrackEvent,
//   remoteUserId: string
// ) => {
//   console.log("handle track event");
//   addTrack(remoteUserId, event.track);
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
//       sendToServer({
//         type: "media-offer",
//         target: remoteUserId,
//         sdp: myPeerConnection.localDescription!,
//       });
//     })
//     .catch(handleError);
// };

// const handleError = (e: any) => {
//   console.error(e);
// };

// // // remoteUserId not supplied in case of creating peer connection as answer to a video offer

// // /******************** RTCPEERCONNECTION EVENT HANDLERS ***************************/

// // /************** SIGNALLING EVENT HANDLERS ************************/
// // // export function handleGetRoomParticipants(participants: string[]) {
// // //   log("Received participants: " + participants);
// // //   participants.forEach((userId) => createPeerConnection(userId));
// // // }

// export function handleMediaOffer(msg: SocketMessage) {
//   console.log("HANDLE MEDIA OFFER");
//   let peer = peers[msg.source];
//   if (!peer) {
//     console.log("Creating peer connection after receiving media offer");
//     peers[msg.source] = {
//       peerConnection: createPeerConnection(msg.source),
//     };
//   }
//   console.log(msg.sdp);
//   const peerConnection = peers[msg.source].peerConnection;

//   peerConnection
//     .setRemoteDescription(new RTCSessionDescription(msg.sdp))
//     .then(() => {
//       return peerConnection.createAnswer();
//     })
//     .then((answer) => {
//       return peerConnection.setLocalDescription(answer);
//     })
//     .then(() => {
//       sendToServer({
//         type: "media-answer",
//         target: msg.source,
//         sdp: peerConnection.localDescription,
//       });
//     })
//     // TODO: revert this catch block once you've figured out why the sdp error occurs
//     .catch((error) => {
//       console.log(msg.sdp.sdp); // Failed to set remote video description send parameters for m-section with mid='0'});
//       handleError(error);
//     });
//   createRemoteVideo(msg.source, msg.nickname);
// }

// // // export function handleMediaAnswer(msg: Message) {
// // //   peerConnections[msg.source].setRemoteDescription(
// // //     new RTCSessionDescription(msg.sdp)
// // //   );
// // //   createRemoteVideoElement(msg.source);

// // //   // Send media tracks if available. This may trigger negotiation again
// // //   // sendAudio(peerConnections[msg.source]);
// // //   // sendVideo(peerConnections[msg.source]);
// // //   // sendScreen(peerConnections[msg.source]);
// // // }

export const a = 1;
