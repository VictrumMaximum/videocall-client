import { useEffect, useRef } from "react";

import styles from "./MainVideo.module.scss";

type MainVideoProps = {
  stream: MediaStream | null;
  placeHolder: React.ReactElement | null;
  showVideoTrack: boolean;
};

export const MainVideo = (props: MainVideoProps) => {
  const { stream, placeHolder, showVideoTrack } = props;
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={styles.mainVideoContainer}>
      <video
        className={`${styles.mainVideo} ${
          showVideoTrack ? "" : styles.invisible
        }`}
        // id={user.id}
        ref={ref}
        autoPlay
      ></video>
      <div
        className={`${styles.placeHolderContainer} ${
          stream || showVideoTrack ? styles.invisible : ""
        }`}
      >
        {placeHolder}
      </div>
    </div>
  );
};
