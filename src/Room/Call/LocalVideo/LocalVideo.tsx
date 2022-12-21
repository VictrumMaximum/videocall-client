import React, { useEffect, useRef } from "react";
import { useStreams } from "../MediaStreams/StreamProvider";
import styles from "./LocalVideo.module.scss";

export const LocalVideo = () => {
  const { userDevices } = useStreams();
  const videoRef = useRef<HTMLVideoElement>(null);

  const stream = userDevices.stream;

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  if (!stream) {
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
