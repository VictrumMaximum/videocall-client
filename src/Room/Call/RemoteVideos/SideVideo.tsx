import { useEffect, useRef } from "react";

import styles from "./SideVideo.module.scss";

type SideVideoProps = {
  stream: MediaStream | null;
  showVideoTrack: boolean;
};

export const SideVideo = (props: SideVideoProps) => {
  const { stream, showVideoTrack } = props;
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className={styles.sideVideoContainer}>
      <video
        className={`${styles.sideVideo} ${
          showVideoTrack ? "" : styles.invisible
        }`}
        // id={user.id}
        ref={ref}
        autoPlay
      ></video>
    </div>
  );
};
