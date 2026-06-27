import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  user: User | null;
  login: (username: string, pin: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (username: string, pin: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('app_users')
      .select('*')
      .ilike('first_name', username)
      .eq('pin', pin)
      .eq('is_active', true)
      .maybeSingle();

    if (error || !data) return false;

    const mapped: User = {
      id: data.id,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email ?? '',
      role: data.role as User['role'],
      pin: data.pin,
      isActive: data.is_active,
    };
    setUser(mapped);
    return true;
  };

  const logout = () => {
    setUser(null);
  };

  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};