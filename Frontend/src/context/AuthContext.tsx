import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import * as authService from '@/services/auth';

export type AccountType = 'buyer_seller' | 'business';

export interface AuthUser {
  id: string;
  email: string;
  accountType: AccountType;
  displayName: string;
  phone?: string;
  businessName?: string;
  businessCategory?: string;
  createdAt: number;
  lastLoginAt?: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  register: (data: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
    accountType: AccountType;
    businessName?: string;
    businessCategory?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const SESSION_KEY = 'marbou-session-v2';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const session = localStorage.getItem(SESSION_KEY);
      return session ? JSON.parse(session) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(SESSION_KEY);
    }
  }, [user]);

  const register = async (data: {
    email: string;
    password: string;
    displayName: string;
    phone?: string;
    accountType: AccountType;
    businessName?: string;
    businessCategory?: string;
  }) => {
    const result = await authService.register(data);
    // Note: Don't set user yet - OTP verification required first
    return { success: result.success, error: result.error };
  };

  const login = async (email: string, password: string) => {
    const result = await authService.login(email, password);
    if (result.success && result.session) {
      setUser(result.session.user);
    }
    return { success: result.success, error: result.error };
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  return (
    <AuthContext.Provider value={{ user, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

export { authService };
