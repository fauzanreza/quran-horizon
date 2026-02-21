"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

type TranslationMode = "id" | "en";
type ScriptMode = "indonesia" | "madinah";

interface SettingsContextType {
  translation: TranslationMode;
  script: ScriptMode;
  fontSizeArabic: number;
  fontSizeLatin: number;
  fontSizeTranslation: number;
  showArabic: boolean;
  showLatin: boolean;
  showTranslation: boolean;
  setTranslation: (mode: TranslationMode) => void;
  setScript: (mode: ScriptMode) => void;
  setFontSizeArabic: (size: number) => void;
  setFontSizeLatin: (size: number) => void;
  setFontSizeTranslation: (size: number) => void;
  setShowArabic: (show: boolean) => void;
  setShowLatin: (show: boolean) => void;
  setShowTranslation: (show: boolean) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [translation, setTranslation] = useState<TranslationMode>("id");
  const [script, setScript] = useState<ScriptMode>("indonesia");
  
  // Font Sizes
  const [fontSizeArabic, setFontSizeArabic] = useState(32);
  const [fontSizeLatin, setFontSizeLatin] = useState(14);
  const [fontSizeTranslation, setFontSizeTranslation] = useState(16);
  
  // Display Toggles
  const [showArabic, setShowArabic] = useState(true);
  const [showLatin, setShowLatin] = useState(true);
  const [showTranslation, setShowTranslation] = useState(true);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("quran_settings");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.translation) setTranslation(parsed.translation);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.script) setScript(parsed.script);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.fontSizeArabic) setFontSizeArabic(parsed.fontSizeArabic);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.fontSizeLatin) setFontSizeLatin(parsed.fontSizeLatin);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.fontSizeTranslation) setFontSizeTranslation(parsed.fontSizeTranslation);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.showArabic !== undefined) setShowArabic(parsed.showArabic);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.showLatin !== undefined) setShowLatin(parsed.showLatin);
        // eslint-disable-next-line react-hooks/set-state-in-effect
        if (parsed.showTranslation !== undefined) setShowTranslation(parsed.showTranslation);
      } catch (e) {
        console.error("Failed to parse settings", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    const settings = {
      translation,
      script,
      fontSizeArabic,
      fontSizeLatin,
      fontSizeTranslation,
      showArabic,
      showLatin,
      showTranslation,
    };
    localStorage.setItem("quran_settings", JSON.stringify(settings));
  }, [translation, script, fontSizeArabic, fontSizeLatin, fontSizeTranslation, showArabic, showLatin, showTranslation]);

  return (
    <SettingsContext.Provider value={{ 
      translation, script, fontSizeArabic, fontSizeLatin, fontSizeTranslation,
      showArabic, showLatin, showTranslation,
      setTranslation, setScript, setFontSizeArabic, setFontSizeLatin, setFontSizeTranslation,
      setShowArabic, setShowLatin, setShowTranslation
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error("useSettings must be used within a SettingsProvider");
  }
  return context;
}
