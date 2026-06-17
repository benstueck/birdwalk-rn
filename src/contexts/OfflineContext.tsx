import React, { createContext, useContext, useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@offline_mode_enabled";

interface OfflineContextType {
  isOfflineMode: boolean;
  pendingSyncCount: number;
  setPendingSyncCount: (count: number) => void;
  enableOfflineMode: () => Promise<void>;
  disableOfflineMode: () => Promise<void>;
}

const OfflineContext = createContext<OfflineContextType | null>(null);

export function OfflineProvider({ children }: { children: React.ReactNode }) {
  const [isOfflineMode, setIsOfflineMode] = useState(false);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((value) => {
      if (value === "true") setIsOfflineMode(true);
      initialized.current = true;
    });
  }, []);

  const enableOfflineMode = async () => {
    setIsOfflineMode(true);
    await AsyncStorage.setItem(STORAGE_KEY, "true");
    // Phase 5: trigger initial Supabase → local DB population here
  };

  const disableOfflineMode = async () => {
    // Phase 5: trigger sync here before clearing mode
    setIsOfflineMode(false);
    setPendingSyncCount(0);
    await AsyncStorage.setItem(STORAGE_KEY, "false");
  };

  return (
    <OfflineContext.Provider
      value={{
        isOfflineMode,
        pendingSyncCount,
        setPendingSyncCount,
        enableOfflineMode,
        disableOfflineMode,
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
}

export function useOffline() {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error("useOffline must be used within OfflineProvider");
  return ctx;
}
