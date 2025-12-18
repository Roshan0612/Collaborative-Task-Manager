import { createContext, useCallback, useEffect, useMemo, useState } from 'react';
import { http } from '../api/http';
import type { AuthResponse, LoginPayload, RegisterPayload, User } from '../types/auth';

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    // Fallback to hide the loader quickly even if the API is slow/cold-starting
    const fallback = setTimeout(() => {
      if (mounted) setLoading(false);
    }, 1500);

    (async () => {
      try {
        const { data } = await http.get<{ user: User }>("/auth/me", { timeout: 4000 });
        if (mounted) setUser(data.user);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
        clearTimeout(fallback);
      }
    })();

    return () => {
      mounted = false;
      clearTimeout(fallback);
    };
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

  const value = useMemo<AuthContextValue>(() => ({ user, loading, login, register, logout }), [user, loading, login, register, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
