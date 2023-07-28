import React, { useState } from "react";

import styles from "./ConstraintsSettings.module.scss";
import { useStreams } from "../../MediaStreams/StreamProvider";
import { useTheme } from "../../../../App";

type Props = {};

export const ConstraintsSettings = (props: Props) => {
  const [cameraConstraints, setCameraConstraints] =
    useState<MediaTrackConstraints>({});

  const [showApplied, setShowApplied] = useState(false);

  const { colors } = useTheme();

  const { camera } = useStreams();

  const supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
  const videoConstraints: (keyof MediaTrackSupportedConstraints)[] = [
    "aspectRatio",
    "facingMode",
    "frameRate",
    "height",
    "width",
    "deviceId",
  ];

  return (
    <div className={styles.container}>
      <div className={styles.constraintContainer}>
        <h2 className={styles.constraintCategoryHeader}>Camera</h2>
        {videoConstraints.map((name) => (
          <div key={name} className={styles.constraintInputContainer}>
            <label className={styles.constraintLabel}>{name}</label>
            <input
              className={styles.constraintInput}
              disabled={!supportedConstraints[name]}
              onChange={(e) => {
                setCameraConstraints((oldConstraints) => ({
                  ...oldConstraints,
                  [name]: e.target.value,
                }));
              }}
            />
          </div>
        ))}
        <div
          className={styles.applyButton}
          style={{ backgroundColor: colors.color1 }}
          onClick={async () => {
            await camera.mergeConstraints(cameraConstraints);
            setShowApplied(true);
            setTimeout(() => setShowApplied(false), 2000);
          }}
        >
          apply
        </div>
        <span>{showApplied && "Applied!"}</span>
      </div>
      <div className={styles.actualConstraintsContainer}>
        Actual constraints
        {camera.actualConstraints &&
          Object.entries(camera.actualConstraints).map(([name, value]) => (
            <div key={name}>
              <span>{name}:</span>
              <span>{value}</span>
            </div>
          ))}
      </div>
    </div>
  );
};
