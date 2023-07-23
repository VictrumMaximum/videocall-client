import React, { createContext, useContext, useState } from "react";
import { Route, Routes } from "react-router-dom";

import { Welcome } from "./Welcome/Welcome";

import "./global.scss";
import { Room } from "./Room/Room";
import { LocalStorage } from "./Utils/LocalStorage/LocalStorage";

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/videocall" element={<Welcome />} />
        <Route path="/videocall/:roomId" element={<Welcome />} />
        <Route path="/videocall/room/:roomId" element={<Room />} />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;

const PageNotFound = () => {
  return <div>Page not found.</div>;
};

export enum ThemeColor {
  Color1 = "color1",
  Color2 = "color2",
  Color3 = "color3",
  TextColor1 = "text color 1",
  TextColor2 = "text color 2",
}

interface IThemeContext {
  colors: Record<ThemeColor, string>;
  setColor: (name: ThemeColor, newColor: string) => void;
  save: () => void;
}

const ThemeContext = createContext<IThemeContext | null>(null);

export const ThemeProvider: React.FC = ({ children }) => {
  const [colors, setColors] = useState<IThemeContext["colors"]>({
    color1: LocalStorage.theme.getColor(ThemeColor.Color1) || "rgb(119, 80, 0)",
    color2: LocalStorage.theme.getColor(ThemeColor.Color2) || "#540000",
    color3: LocalStorage.theme.getColor(ThemeColor.Color3) || "rgb(19, 85, 90)",
    "text color 1":
      LocalStorage.theme.getColor(ThemeColor.TextColor1) || "black",
    "text color 2":
      LocalStorage.theme.getColor(ThemeColor.TextColor1) || "#7c7c7c",
  });

  const setColor = (name: ThemeColor, newColor: string) => {
    setColors((oldColors) => ({
      ...oldColors,
      [name]: newColor,
    }));
  };

  const save = () => {
    for (const [name, color] of Object.entries(colors)) {
      LocalStorage.theme.setColor(name as ThemeColor, color);
    }
  };

  const value: IThemeContext = {
    colors,
    setColor,
    save,
  };

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("ThemeContext not defined!");
  }

  return context;
};
