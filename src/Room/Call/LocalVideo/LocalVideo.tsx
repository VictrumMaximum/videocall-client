import React, { useEffect, useMemo, useRef } from "react";
import { useStreams } from "../MediaStreams/StreamProvider";
import styles from "./LocalVideo.module.scss";

export const LocalVideo = () => {
  const { camTrack: track } = useStreams();
  const videoRef = useRef<HTMLVideoElement>(null);
  const stream = useMemo(() => new MediaStream(), []);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream, track]);

  useEffect(() => {
    if (track) {
      stream.addTrack(track);
    } else {
      stream.getTracks().forEach((t) => stream.removeTrack(t));
    }
  }, [track, stream]);

  if (!track) {
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
