export const a = "";
// import { PeerConnections } from "./Connection/PeerConnection";

// interface VideoStreamArgs {
//   setIconEnabled: (enabled: boolean) => void;
//   setLocalStream: (stream: any) => void; // for our own camera
//   peerConnections: PeerConnections;
// }

// class VideoStream {
//   private setIconEnabled;

//   constructor(args: VideoStreamArgs) {
//     this.setIconEnabled = args.setIconEnabled;
//   }
// }

// let videoStream: MediaStream | null = null;

// export const toggleCamera = (setIconEnabled: (enabled: boolean) => void) => {
//   console.log("toggle camera");
//   if (videoStream) {
//     // Stop browser from accessing the device
//     // https://stackoverflow.com/questions/11642926/stop-close-webcam-stream-which-is-opened-by-navigator-mediadevices-getusermedia
//     videoStream.getVideoTracks().forEach((track) => {
//       track.stop();
//     });
//     videoStream = null;
//     localVideoElement.srcObject = null;

//     // Remove tracks from peerConnections
//     Object.values(peerConnections).forEach((myPeerConnection) =>
//       muteVideo(myPeerConnection)
//     );
//     setIconEnabled(false);
//   } else {
//     // Request access to device
//     navigator.mediaDevices
//       .getUserMedia(cameraConstraints)
//       .then((stream) => {
//         setIconEnabled(videoButton, true);
//         videoStream = stream;
//         localVideoElement.srcObject = stream;

//         // If not screensharing, send track to peerConnections
//         // TODO: Is it correct to check for "not null" with !localScreenStream?
//         if (localScreenStream == null) {
//           // == instead of === to include 'undefined'
//           Object.values(peerConnections).forEach((myPeerConnection) =>
//             sendVideo(myPeerConnection)
//           );
//         }
//       })
//       .catch(handleError);
//   }
// };

// function muteVideo(myPeerConnection: RTCPeerConnection) {
//   if (myPeerConnection["videoSender"]) {
//     // removeTrack triggers negotiation
//     myPeerConnection.removeTrack(myPeerConnection["videoSender"]);
//     myPeerConnection["videoSender"] = null;
//   }
// }
