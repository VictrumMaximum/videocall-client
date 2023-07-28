import React, { useEffect, useRef } from "react";
import { useStreams } from "../MediaStreams/StreamProvider";
import styles from "./LocalVideo.module.scss";

export const LocalVideo = () => {
  const { camera } = useStreams();
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = camera.stream;
    }
  }, [camera.stream]);

  if (!camera.stream) {
    return null;
  }

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
