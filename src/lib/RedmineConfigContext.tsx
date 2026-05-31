"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import type { RedmineConfig } from "@/types/redmine";

interface RedmineConfigContextValue {
  config: RedmineConfig | null;
  setConfig: (config: RedmineConfig) => void;
  clearConfig: () => void;
}

const RedmineConfigContext = createContext<RedmineConfigContextValue | null>(
  null
);

const STORAGE_KEY = "redmine_config";

export function RedmineConfigProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, setConfigState] = useState<RedmineConfig | null>(null);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setConfigState(JSON.parse(stored));
      } catch {
        // ignore corrupt storage
      }
    }
  }, []);

  const setConfig = (c: RedmineConfig) => {
    setConfigState(c);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(c));
  };

  const clearConfig = () => {
    setConfigState(null);
    sessionStorage.removeItem(STORAGE_KEY);
  };

  return (
    <RedmineConfigContext.Provider value={{ config, setConfig, clearConfig }}>
      {children}
    </RedmineConfigContext.Provider>
  );
}

export function useRedmineConfig(): RedmineConfigContextValue {
  const ctx = useContext(RedmineConfigContext);
  if (!ctx) {
    throw new Error(
      "useRedmineConfig must be used within a RedmineConfigProvider"
    );
  }
  return ctx;
}
