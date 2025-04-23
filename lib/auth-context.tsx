// lib/auth-context.tsx
'use client';

import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';

interface User {
  id: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  const login = () => {
    // TODO: replace with real auth logic
    setUser({ id: 'guest-' + Math.random().toString(36).substring(2, 9), name: 'Guest' });
  };
  const logout = () => {
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
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
