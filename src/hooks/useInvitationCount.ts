import { useEffect, useState, useCallback } from "react";
import { AppState } from "react-native";
import { supabase } from "../lib/supabase";
import { getPendingInvitationCount } from "../services/invitationService";
import { useAuth } from "../contexts/AuthContext";

export function useInvitationCount() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    const n = await getPendingInvitationCount();
    setCount(n);
  }, []);

  useEffect(() => {
    if (!user) return;

    refresh();

    // Real-time subscription
    const channel = supabase
      .channel(`invitations:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "walk_invitations",
          filter: `invitee_id=eq.${user.id}`,
        },
        () => refresh()
      )
      .subscribe();

    // Re-fetch when app comes back to foreground
    const sub = AppState.addEventListener("change", (state) => {
      if (state === "active") refresh();
    });

    return () => {
      supabase.removeChannel(channel);
      sub.remove();
    };
  }, [user, refresh]);

  return { count, refresh };
}
