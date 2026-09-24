'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthUser } from '@/types';
import { clearAuth, getStoredUser, saveAuth } from '@/lib/auth';

interface AuthContextValue {
  user: AuthUser | null;
  login: (user: AuthUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Start null so server and client first-render match (avoids hydration mismatch).
  // After mount we read localStorage — this is safe because it only runs client-side.
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    // Runs once after hydration. Sync localStorage → state.
    // No artificial isLoading delay — just a quick state update on first paint.
    setUser(getStoredUser());
  }, []);

  const login = (u: AuthUser) => {
    saveAuth(u);
    setUser(u);
  };

  const logout = () => {
    clearAuth();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
