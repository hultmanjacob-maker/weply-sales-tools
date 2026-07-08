import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

type State = {
  user: User | null;
  session: Session | null;
  isAdmin: boolean;
  loading: boolean;
};

export function useAuth(): State & { signOut: () => Promise<void> } {
  const [state, setState] = useState<State>({
    user: null,
    session: null,
    isAdmin: false,
    loading: true,
  });

  useEffect(() => {
    let active = true;

    const applySession = async (session: Session | null) => {
      if (!active) return;
      if (!session?.user) {
        setState({ user: null, session: null, isAdmin: false, loading: false });
        return;
      }
      // Query user's own role row (RLS: users can view own roles)
      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id);
      const isAdmin = (data ?? []).some((r) => r.role === "admin");
      if (!active) return;
      setState({ user: session.user, session, isAdmin, loading: false });
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      applySession(session);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return { ...state, signOut };
}
