import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getPendingInvitationCount } from "../services/invitationService";
import { useAuth } from "./AuthContext";

interface InvitationCountContextValue {
  count: number;
  refresh: () => Promise<void>;
  clear: () => void;
}

const InvitationCountContext = createContext<InvitationCountContextValue>({
  count: 0,
  refresh: async () => {},
  clear: () => {},
});

export function InvitationCountProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const n = await getPendingInvitationCount();
    setCount(n);
  }, []);

  const clear = useCallback(() => setCount(0), []);

  useEffect(() => {
    if (!user) { setCount(0); return; }
    refresh();
  }, [user]);

  return (
    <InvitationCountContext.Provider value={{ count, refresh, clear }}>
      {children}
    </InvitationCountContext.Provider>
  );
}

export function useInvitationCount() {
  return useContext(InvitationCountContext);
}
