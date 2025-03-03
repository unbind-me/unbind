import React, { createContext, useState, ReactNode } from "react";
import themes from "./themes";
import { DarkTheme, Theme } from "@react-navigation/native";
interface ThemeContextProps {
  isDark: boolean;
  toggleTheme: () => void;
  theme: Theme; // Or use your own type if you have a custom shape
}
interface ThemeProviderProps {
  children: ReactNode; // or React.ReactNode
}
export const ThemeContext = createContext({
  isDark: false,
  toggleTheme: () => {},
  theme: DarkTheme,
});

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [isDark, setIsDark] = useState(false);
  const toggleTheme = () => setIsDark((prev) => !prev);
  const theme = isDark ? themes.customDarkTheme : themes.customLightTheme;

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, theme }}>
      {children}
    </ThemeContext.Provider>
  );
};
