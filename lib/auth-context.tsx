"use client";

import { createContext, useContext, type ReactNode } from "react";
import { authClient } from "./auth-client";
import type { User } from "./types";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signIn: (callbackURL?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

function mapBetterAuthUser(sessionUser: {
  id: string;
  email: string;
  name?: string | null;
  image?: string | null;
}): User {
  return {
    id: sessionUser.id,
    email: sessionUser.email,
    name: sessionUser.name ?? sessionUser.email,
    avatarUrl: sessionUser.image ?? undefined,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, isPending } = authClient.useSession();
  const user = sessionData?.user ? mapBetterAuthUser(sessionData.user) : null;

  const signIn = async (callbackURL = "/dashboard") => {
    await authClient.signIn.social({
      provider: "google",
      callbackURL,
    });
  };

  const signOut = async () => {
    await authClient.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, loading: isPending, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
