import { QueryClient } from "@tanstack/react-query";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { User } from "./api";

interface AuthCtx {
  user: User | null;
  setUser: (u: User | null) => void;
  logout: () => void;
}

const Ctx = createContext<AuthCtx>({ user: null, setUser: () => {}, logout: () => {} });

let globalQueryClient: QueryClient | null = null;

export const setQueryClient = (qc: QueryClient) => {
  globalQueryClient = qc;
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUserState] = useState<User | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const raw = localStorage.getItem("tb_user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  const clearCacheAndStorage = () => {
    if (globalQueryClient) {
      globalQueryClient.clear();
    }
  };

  const setUser = (u: User | null) => {
    setUserState(u);
    if (typeof window !== "undefined") {
      if (u) localStorage.setItem("tb_user", JSON.stringify(u));
      else localStorage.removeItem("tb_user");
    }
  };

  const logout = () => {
    clearCacheAndStorage();
    setUser(null);
  };

  return (
    <Ctx.Provider value={{ user, setUser, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(Ctx);
  return ctx;
};
