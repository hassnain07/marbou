import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type AccountType = 'buyer_seller' | 'business';

export interface AuthUser {
  id: string;
  email: string;
  accountType: AccountType;
  displayName: string;
  phone: string;
  businessName?: string;
  businessCategory?: string;
}

interface AuthContextValue {
  user: AuthUser | null;
  register: (data: Omit<AuthUser, 'id'>) => { success: boolean; error?: string };
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);
const USERS_KEY = 'marbou-users';
const SESSION_KEY = 'marbou-session';

interface StoredUser extends AuthUser {
  password: string;
}

function getStoredUsers(): StoredUser[] {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '[]');
  } catch {
    return [];
  }
}

function saveStoredUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

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

  const register: AuthContextValue['register'] = (data) => {
    const users = getStoredUsers();
    if (users.some((u) => u.email === data.email)) {
      return { success: false, error: 'emailExists' };
    }
    const newUser: StoredUser = {
      ...data,
      id: `user-${Date.now()}`,
      password: (data as any).password || '',
    };
    users.push(newUser);
    saveStoredUsers(users);
    const { password: _, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    return { success: true };
  };

  const login: AuthContextValue['login'] = (email, password) => {
    const users = getStoredUsers();
    const found = users.find((u) => u.email === email && u.password === password);
    if (!found) {
      return { success: false, error: 'invalidCredentials' };
    }
    const { password: _, ...userWithoutPassword } = found;
    setUser(userWithoutPassword);
    return { success: true };
  };

  const logout = () => setUser(null);

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
