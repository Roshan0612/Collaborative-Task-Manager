import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { http } from '../api/http';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';

export type AuthContextValue = {
  user: User | null;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        const { data } = await http.get<{ user: User }>("/auth/me");
        if (isMounted) setUser(data.user);
      } catch {
        if (isMounted) setUser(null);
      }
    })();
    return () => { isMounted = false; };
  }, []);

  const persist = useCallback((data: AuthResponse) => {
    setUser(data.user);
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { data } = await http.post<AuthResponse>('/auth/login', payload);
    persist(data);
  }, [persist]);

  const register = useCallback(async (payload: RegisterPayload) => {
    const { data } = await http.post<AuthResponse>('/auth/register', payload);
    persist(data);
  }, [persist]);

  const logout = useCallback(async () => {
    try { await http.post('/auth/logout'); } catch {}
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(() => ({ user, login, register, logout }), [user, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
