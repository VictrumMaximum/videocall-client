import React, { useMemo, useState } from "react";

import styles from "./SettingsPopup.module.scss";
import { DevicesSettings } from "./DevicesSettings/DevicesSettings";
import { ThemeSettings } from "./ThemeSettings/ThemeSettings";
import { useTheme } from "../../../App";
import { TabularSelect } from "./TabularSelect/TabularSelect";

enum TabId {
  DEVICES = "Devices",
  THEME = "Theme",
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
    }
  }, [tab]);

  const items = [{ label: TabId.DEVICES }, { label: TabId.THEME }];

  return (
    <div className={styles.container}>
      <div
        className={styles.centerContainer}
        style={{ backgroundColor: colors.color3 }}
      >
        <div className={styles.header}>Settings</div>
        <div>v1.04</div>
        <TabularSelect
          orientation="row"
          activeItem={tab}
          setActiveItem={(x) => setTab(x)}
          items={items}
        />
        <div className={styles.contentContainer}>{content}</div>
      </div>
    </div>
  );
};
