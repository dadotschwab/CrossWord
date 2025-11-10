import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/database.types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user on mount
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const register = async (email: string, _password: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    const trialEndsAt = new Date();
    trialEndsAt.setDate(trialEndsAt.getDate() + 7); // 7 days from now

    const newUser: User = {
      id: crypto.randomUUID(),
      email,
      is_premium: false,
      trial_ends_at: trialEndsAt.toISOString(),
      created_at: new Date().toISOString(),
    };

    localStorage.setItem('mockUser', JSON.stringify(newUser));
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    // Simulate API call delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // For mock purposes, check if user exists in localStorage
    const storedUser = localStorage.getItem('mockUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      if (user.email === email) {
        setUser(user);
        return;
      }
    }

    // If no user found, create a new one (mock behavior)
    await register(email, password);
  };

  const logout = () => {
    localStorage.removeItem('mockUser');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
