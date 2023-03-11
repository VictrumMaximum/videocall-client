import React from "react";

import { ReactComponent as GearIcon } from "./gear.svg";

import styles from "./SettingsIcon.module.scss";

type Props = {
  toggleSettings: () => void;
};

export const SettingsIcon = (props: Props) => {
  return (
    <div className={styles.container} onClick={() => props.toggleSettings()}>
      <GearIcon className={styles.gearIcon} />
    </div>
  );
};
