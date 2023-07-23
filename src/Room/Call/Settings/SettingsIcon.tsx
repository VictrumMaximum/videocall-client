import React from "react";

import { ReactComponent as GearIcon } from "./gear.svg";

import styles from "./SettingsIcon.module.scss";
import { useTheme } from "../../../App";

type Props = {
  toggleSettings: () => void;
};

export const SettingsIcon = (props: Props) => {
  const { colors } = useTheme();
  return (
    <div className={styles.container} onClick={() => props.toggleSettings()}>
      <GearIcon
        className={styles.gearIcon}
        style={{ fill: colors.color3, stroke: colors.color3 }}
      />
    </div>
  );
};
