import { createContext, useContext, useState, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  login: (token: string, user?: User, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('tw_customer_token');
  });
  const [user, setUser] = useState<User | null>(null);

  const login = (token: string, userData?: User, refreshToken?: string) => {
    localStorage.setItem('tw_customer_token', token);
    if (refreshToken) {
      localStorage.setItem('tw_customer_refresh_token', refreshToken);
    }
    setAccessToken(token);
    setUser(userData || null);
  };

  const logout = () => {
    localStorage.removeItem('tw_customer_token');
    localStorage.removeItem('tw_customer_refresh_token');
    setAccessToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ accessToken, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthStore() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthStore must be used within an AuthProvider');
  }
  return context;
}
