import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (email: string, pass: string) => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check local storage for persisted session
    const storedUser = localStorage.getItem('projectflow_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, pass: string): Promise<boolean> => {
    // SIMULATED AUTHENTICATION LOGIC
    // In a real app, this would call a backend API
    return new Promise((resolve) => {
      setTimeout(() => {
        if (email === 'admin@flow.com' && pass === 'admin123') {
          const adminUser: User = {
            id: 'admin-1',
            name: 'Administrator',
            email: 'admin@flow.com',
            role: 'admin',
            avatar: 'https://ui-avatars.com/api/?name=Admin&background=4f46e5&color=fff'
          };
          setUser(adminUser);
          localStorage.setItem('projectflow_user', JSON.stringify(adminUser));
          resolve(true);
        } else if (email === 'user@flow.com' && pass === 'user123') {
          const regularUser: User = {
            id: 'user-1',
            name: 'Project Manager',
            email: 'user@flow.com',
            role: 'user',
            avatar: 'https://ui-avatars.com/api/?name=PM&background=0ea5e9&color=fff'
          };
          setUser(regularUser);
          localStorage.setItem('projectflow_user', JSON.stringify(regularUser));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 800); // Simulate network delay
    });
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('projectflow_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
