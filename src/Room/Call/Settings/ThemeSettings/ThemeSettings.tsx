import React, { useState } from "react";
import { ChromePicker } from "react-color";

import styles from "./ThemeSettings.module.scss";
import { ThemeColor, useTheme } from "../../../../App";
import { TabularSelect } from "../TabularSelect/TabularSelect";

export const ThemeSettings = () => {
  const [activeColor, setActiveColor] = useState(ThemeColor.Color1);
  const { colors, save } = useTheme();
  const [hasSaved, setHasSaved] = useState(false);

  const items = Object.values(ThemeColor).map((name) => ({
    label: name,
  }));

  return (
    <div className={styles.themeContainer}>
      <div className={styles.themeColorsContainer}>
        <TabularSelect
          orientation="column"
          activeItem={activeColor}
          setActiveItem={(x) => setActiveColor(x)}
          items={items}
        />
        <ColorPicker name={activeColor} />
      </div>
      <div
        className={styles.saveButton}
        style={{ backgroundColor: colors.color1 }}
        onClick={() => {
          save();
          setHasSaved(true);
          setTimeout(() => setHasSaved(false), 2000);
        }}
      >
        Save
      </div>
      <span>{hasSaved && "Saved!"}</span>
    </div>
  );
};

type ColorPickerProps = {
  name: ThemeColor;
};

const ColorPicker = ({ name }: ColorPickerProps) => {
  const { colors, setColor } = useTheme();

  return (
    <div className={styles.colorPickerContainer}>
      <div className={styles.colorPicker}>
        <ChromePicker
          color={colors[name]}
          onChange={(x) => {
            setColor(
              name,
              `rgba(${x.rgb.r}, ${x.rgb.g}, ${x.rgb.b}, ${x.rgb.a})`
            );
          }}
        />
      </div>
    </div>
  );
};
