"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { translations, Lang } from "@/lib/i18n";
import { getTheme, Theme, Mode } from "@/lib/themes";

interface AppContextType {
  lang: Lang;
  mode: Mode;
  setLang: (l: Lang) => void;
  setMode: (m: Mode) => void;
  tr: (key: string) => string;
  isRTL: boolean;
  theme: Theme;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");
  const [mode, setModeState] = useState<Mode>("adult");

  useEffect(() => {
    const savedLang = localStorage.getItem("ql");
    const savedMode = localStorage.getItem("qm");
    if (savedLang === "en" || savedLang === "ar") setLangState(savedLang);
    if (savedMode === "adult" || savedMode === "child") setModeState(savedMode);
  }, []);

  useEffect(() => {
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = lang;
  }, [lang]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem("ql", l);
  };

  const setMode = (m: Mode) => {
    setModeState(m);
    localStorage.setItem("qm", m);
  };

  const tr = (key: string): string =>
    (translations[lang] as Record<string, string>)[key] ?? key;

  return (
    <AppContext.Provider
      value={{ lang, mode, setLang, setMode, tr, isRTL: lang === "ar", theme: getTheme(mode) }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
