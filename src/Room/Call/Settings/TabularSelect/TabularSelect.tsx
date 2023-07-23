import React from "react";

import styles from "./TabularSelect.module.scss";
import { useTheme } from "../../../../App";

type Props<T extends string> = {
  orientation: "row" | "column";
  items: {
    label: T;
  }[];
  setActiveItem: (label: T) => void;
  activeItem: T;
};

export const TabularSelect = (props: Props<any>) => {
  const content =
    props.orientation === "row" ? (
      <HorizontalBar {...props} />
    ) : (
      <VerticalBar {...props} />
    );

  return (
    <table className={styles.tabBar}>
      <tbody>{content}</tbody>
    </table>
  );
};

const HorizontalBar = ({ items, activeItem, setActiveItem }: Props<any>) => {
  return (
    <tr>
      {items.map((item) => (
        <Tab
          key={item.label}
          label={item.label}
          activeTab={activeItem}
          setActiveTab={setActiveItem}
        />
      ))}
    </tr>
  );
};

const VerticalBar = ({ items, activeItem, setActiveItem }: Props<any>) => {
  return (
    <>
      {items.map((item) => (
        <tr key={item.label}>
          <Tab
            label={item.label}
            activeTab={activeItem}
            setActiveTab={setActiveItem}
          />
        </tr>
      ))}
    </>
  );
};

type TabProps<T> = {
  label: T;
  setActiveTab: (label: T) => void;
  activeTab: T;
};

const Tab = ({ label, setActiveTab, activeTab }: TabProps<any>) => {
  const { colors } = useTheme();
  const isActive = label === activeTab;

  const classNames = `${styles.tab} ${isActive && styles.activeTab}`;

  const style = isActive ? { color: colors["text color 2"] } : {};

  return (
    <td
      key={label}
      className={classNames}
      style={style}
      onClick={() => setActiveTab(label)}
    >
      {label}
    </td>
  );
};
