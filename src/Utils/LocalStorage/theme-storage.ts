import { ThemeColor } from "../../App";

const prefix = "theme.";

const getFullName = (name: string) => prefix + name;

export const getColor = (name: ThemeColor) => {
  return window.localStorage.getItem(getFullName(name));
};

export const setColor = (name: ThemeColor, newColor: string) => {
  window.localStorage.setItem(getFullName(name), newColor);
};
