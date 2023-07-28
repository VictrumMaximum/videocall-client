import React, { useMemo, useState } from "react";

import styles from "./SettingsPopup.module.scss";
import { DevicesSettings } from "./DevicesSettings/DevicesSettings";
import { ThemeSettings } from "./ThemeSettings/ThemeSettings";
import { useTheme } from "../../../App";
import { TabularSelect } from "./TabularSelect/TabularSelect";
import { ConstraintsSettings } from "./ConstraintSettings/ConstraintsSettings";
import { Logs } from "./Logs/Logs";

enum TabId {
  DEVICES = "Devices",
  THEME = "Theme",
  CONSTRAINTS = "Constraints",
  LOGS = "Logs",
}

export const SettingsPopup = () => {
  const [tab, setTab] = useState<TabId>(TabId.DEVICES);
  const { colors } = useTheme();

  const content = useMemo(() => {
    switch (tab) {
      case TabId.DEVICES:
        return <DevicesSettings />;
      case TabId.THEME:
        return <ThemeSettings />;
      case TabId.CONSTRAINTS:
        return <ConstraintsSettings />;
      case TabId.LOGS:
        return <Logs />;
    }
  }, [tab]);

  const items = Object.values(TabId).map((label) => ({ label }));

  return (
    <div className={styles.container}>
      <div
        className={styles.centerContainer}
        style={{ backgroundColor: colors.color3 }}
      >
        <div className={styles.header}>Settings</div>
        <TabularSelect
          orientation="row"
          activeItem={tab}
          setActiveItem={(x) => setTab(x)}
          items={items}
        />
        <div className={styles.contentContainer}>{content}</div>
        <div className={styles.versionIndicator}>v1.11</div>
      </div>
    </div>
  );
};
