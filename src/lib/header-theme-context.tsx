"use client";

import React, { createContext, useContext, useState } from "react";

type HeaderTheme = "dark" | "light"; // dark = white text, light = dark text

interface HeaderThemeContextType {
  theme: HeaderTheme;
  setTheme: (t: HeaderTheme) => void;
}

const HeaderThemeContext = createContext<HeaderThemeContextType>({
  theme: "light",
  setTheme: () => {},
});

export function HeaderThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<HeaderTheme>("light");
  return (
    <HeaderThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </HeaderThemeContext.Provider>
  );
}

export function useHeaderTheme() {
  return useContext(HeaderThemeContext);
}
