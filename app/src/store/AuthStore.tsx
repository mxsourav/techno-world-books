import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  avatarUrl?: string | null;
}

interface AuthState {
  accessToken: string | null;
  user: User | null;
  login: (token: string, user?: User, refreshToken?: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem('twb_user');
    if (!raw || raw === 'null') return null;
    const parsed = JSON.parse(raw);
    // Validate it's a real user object with at least an id or email
    if (parsed && (parsed.id || parsed.email)) return parsed as User;
    return null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('tw_customer_token');
  });
  // Hydrate user from localStorage on startup so session survives page reloads
  const [user, setUser] = useState<User | null>(() => loadUserFromStorage());

  // Keep twb_user in sync whenever user state changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('twb_user', JSON.stringify(user));
    }
  }, [user]);

  const login = (token: string, userData?: User, refreshToken?: string) => {
    localStorage.setItem('tw_customer_token', token);
    if (refreshToken) {
      localStorage.setItem('tw_customer_refresh_token', refreshToken);
    }
    if (userData) {
      localStorage.setItem('twb_user', JSON.stringify(userData));
    }
    setAccessToken(token);
    setUser(userData || null);
  };

  const logout = () => {
    localStorage.removeItem('tw_customer_token');
    localStorage.removeItem('tw_customer_refresh_token');
    localStorage.removeItem('twb_user');
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
