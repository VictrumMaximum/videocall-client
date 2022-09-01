import React, { useEffect, useRef } from "react";
import { PeersState } from "../Connection/Connection";
import styles from "./LocalVideo.module.scss";

let setLocalVideoStream: (stream: MediaStream) => void;
let localVideoStream: MediaStream;

export const LocalVideo = () => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    setLocalVideoStream = (stream) => {
      localVideoStream = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    };
  }, []);

  return (
    <div className={styles.localVideoContainer}>
      <video
        className={styles.videoElement}
        ref={videoRef}
        autoPlay
        muted
      ></video>
    </div>
  );
};

let cameraConstraints = {
  video: {
    facingMode: "user",
    // width: 1280,
    // height: 720,
    // frameRate: 30
  },
};

// TODO: REPLACE THIS
const peers: PeersState = {};

export const toggleCamera = () => {
  navigator.mediaDevices
    .getUserMedia(cameraConstraints)
    .then((stream) => {
      // setIconEnabled(videoButton, true);
      setLocalVideoStream(stream);

      // If not screensharing, send track to peerConnections
      // TODO: Is it correct to check for "not null" with !localScreenStream?
      // if (localScreenStream == null) {  // == instead of === to include 'undefined'
      console.log(peers);
      Object.values(peers).forEach((peer) => sendVideo(peer));
      // }
    })
    .catch(console.error);
};

const sendVideo = (peer: PeersState[string]): boolean => {
  if (!peer.videoSender) {
    console.log("Sending video track");
    const videoTrack = localVideoStream.getVideoTracks()[0];
    if (peer.videoSender) {
      console.log("Replace video track");
      peer.videoSender.replaceTrack(videoTrack);
    } else {
      console.log("New video track");
      peer.videoSender = peer.peerConnection.addTrack(
        videoTrack
        // localStream
      );
    }
    return true;
  }
  return false;
};
