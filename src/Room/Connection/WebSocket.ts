// import {
//   ChatMessageType,
//   Color,
//   ConnectionArgs,
//   loggerType,
//   SocketMessage,
// } from "./Connection";
// import { PeerConnections, PeerConnectionsState } from "./PeerConnection";

// // export let localUserId: string; // supplied by websocket during connect()

// const hostName =
//   process.env.NODE_ENV === "development"
//     ? "ws://localhost:9120"
//     : `wss://${window.location.host}`;

// export interface SocketConnectionArgs extends ConnectionArgs {
//   peerConnections: PeerConnections;
//   sendToServer: (msg: SocketMessage) => void;
//   setLocalUserId: (localUserId: string) => void;
// }

// let receiveMsg: (msg: string, sender: string) => void;

// export class SocketConnection {
//   private readonly socketUrl = `${hostName}/videocall/socket`;

//   private log: loggerType;
//   // private receiveMsg: (msg: string, sender: string) => void;
//   public ws: WebSocket; // accessed in Connection class
//   private roomId: string;
//   private setLocalUserId: (localUserId: string) => void;

//   private updateConnectionStatus: (newStatus: boolean) => void;
//   private peerConnections: PeerConnections;
//   private sendToServer: (msg: SocketMessage) => void;
//   private createRemoteVideoElement: (userId: string) => void;
//   private removeVideoElement: (source: string) => void;

//   constructor(args: SocketConnectionArgs) {
//     console.log(`received peerconnections state:`);
//     console.log(args.peerConnections);
//     this.log = args.log;
//     receiveMsg = args.receiveMsg;
//     this.roomId = args.roomId;
//     this.updateConnectionStatus = args.updateConnectionStatus;
//     this.peerConnections = args.peerConnections;
//     this.sendToServer = args.sendToServer;
//     this.createRemoteVideoElement = args.createRemoteVideoElement;
//     this.removeVideoElement = args.removeVideoElement;
//     this.setLocalUserId = args.setLocalUserId;

//     this.ws = new WebSocket(this.socketUrl);
//     this.setEventHandlers();
//   }

//   private setEventHandlers() {
//     const ws = this.ws;
//     const log = this.log;

//     ws.onopen = () => {
//       // If this is the first time we connect, we need a userId.
//       // Otherwise, simply reconnect and continue using old userId.
//       this.sendToServer({ type: "register", roomId: this.roomId });

//       ws.onmessage = (msg) => {
//         const data: SocketMessage = JSON.parse(msg.data);
//         if (data.type != "new-ice-candidate") {
//           log("Received: " + data.type, Color.GREEN);
//         }

//         switch (data.type) {
//           case "register":
//             this.handleRegister(data);
//             break;
//           case "media-offer":
//             this.handleMediaOffer(data);
//             break;
//           case "media-answer":
//             this.handleMediaAnswer(data);
//             break;
//           case "new-ice-candidate":
//             this.handleNewICECandidateMsg(data);
//             break;
//           case "user-joined-room":
//             this.handleUserJoinedRoom(data);
//             break;
//           case "message":
//             receiveMsg(data.payload, data.nickname || "stranger");
//             break;
//           case "disconnect":
//             this.handleDisconnect(data.source!);
//             break;
//           // case "getRoomParticipants":
//           //   this.handleGetRoomParticipants(data.payload);
//           //   break;
//         }
//       };
//       ws.onclose = (event) => {
//         console.log("get disconnect you bitch");
//         // https://developer.mozilla.org/en-US/docs/Web/API/CloseEvent
//         console.log(event); // usual reason code: 1006

//         this.updateConnectionStatus(false);
//         // immediately try to reconnect
//         this.reconnect();
//       };
//     };
//     return ws;
//   }

//   private reconnect() {
//     // TODO: put this in a timed out loop, and clear it when reconnected.
//     this.ws = new WebSocket(this.socketUrl);
//     this.setEventHandlers();
//   }

//   // private handleGetRoomParticipants(participants: string[]) {
//   //   this.log("Amount of other people in room: " + participants.length);
//   //   this.receiveMsg(
//   //     participants.length + " other people in this room!",
//   //     ChatMessageType.SYSTEM
//   //   );
//   //   participants.forEach((userId) => this.createPeerConnection(userId));
//   // }

//   public disconnect(navigateToHome: () => void) {
//     this.sendToServer({
//       type: "disconnect",
//     });
//     navigateToHome();
//   }

//   /************** SIGNALLING EVENT HANDLERS ************************/

//   private handleUserJoinedRoom(msg: SocketMessage) {
//     const remoteUserId = msg.source!;
//     const nickname = msg.nickname || remoteUserId.substring(0, 7);
//     receiveMsg(
//       "User " + nickname + " joined the room!",
//       ChatMessageType.SYSTEM
//     );
//     this.peerConnections.createPeerConnection(remoteUserId);
//   }

//   private handleMediaOffer(msg: SocketMessage) {
//     let myPeerConnection =
//       this.peerConnections.getState()[msg.source!].peerConnection;
//     if (!myPeerConnection) {
//       this.log("Creating peer connection after receiving media offer");
//       myPeerConnection = this.peerConnections.createPeerConnection(msg.source!);
//     }
//     myPeerConnection
//       .setRemoteDescription(new RTCSessionDescription(msg.sdp!))
//       .then(() => {
//         return myPeerConnection.createAnswer();
//       })
//       .then((answer) => {
//         return myPeerConnection.setLocalDescription(answer);
//       })
//       .then(() => {
//         this.sendToServer({
//           type: "media-answer",
//           target: msg.source,
//           sdp: myPeerConnection.localDescription!,
//         });
//       })
//       // TODO: revert this catch block once you've figured out why the sdp error occurs
//       .catch((error) => {
//         this.log(msg.sdp!.sdp!); // Failed to set remote video description send parameters for m-section with mid='0'});
//         this.handleError(error);
//       });
//     this.createRemoteVideoElement(msg.source!);
//   }

//   private handleMediaAnswer(msg: SocketMessage) {
//     this.peerConnections
//       .getState()
//       [msg.source!].peerConnection.setRemoteDescription(
//         new RTCSessionDescription(msg.sdp!)
//       );
//     this.createRemoteVideoElement(msg.source!);

//     // Send media tracks if available. This may trigger negotiation again
//     // sendAudio(peerConnections[msg.source]);
//     // sendVideo(peerConnections[msg.source]);
//     // sendScreen(peerConnections[msg.source]);
//   }

//   /**
//    * Remove peer connection and video element after a remote user has disconnected from the room.
//    */
//   private handleDisconnect(source: string) {
//     this.log("User " + source + " left the room");
//     receiveMsg(
//       "User " + source.substring(0, 7) + " has left the room!",
//       ChatMessageType.SYSTEM
//     );
//     this.removeVideoElement(source);
//     if (this.peerConnections.getState()[source]) {
//       this.peerConnections.getState()[source].peerConnection.close();
//       delete this.peerConnections.getState()[source];
//     }
//   }

//   private handleRegister(msg: SocketMessage) {
//     this.setLocalUserId(msg.payload);
//     this.log("Registered as " + msg.payload, Color.GREEN);
//     this.sendToServer({ type: "getRoomParticipants" });
//   }

//   private handleError(error: any) {
//     this.log(error, Color.RED);
//   }

//   // event handler for when remote user makes a potential ICE candidate known for his network
//   private handleNewICECandidateMsg(msg: SocketMessage) {
//     if (this.peerConnections.getState()[msg.source!]) {
//       this.peerConnections
//         .getState()
//         [msg.source!].peerConnection.addIceCandidate(
//           new RTCIceCandidate(msg.candidate)
//         )
//         .catch(this.handleError);
//     }
//   }
// }

export const a = 1;
