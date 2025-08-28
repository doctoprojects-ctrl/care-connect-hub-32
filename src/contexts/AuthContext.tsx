import { createContext, useContext, useState, ReactNode } from 'react';
import { User } from '@/types';
import { mockUsers } from '@/store/mockData';

interface AuthContextType {
  user: User | null;
  login: (username: string, pin: string) => boolean;
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

  const login = (username: string, pin: string): boolean => {
    const foundUser = mockUsers.find(
      u => u.firstName.toLowerCase() === username.toLowerCase() && 
           u.pin === pin && 
           u.isActive
    );
    
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
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