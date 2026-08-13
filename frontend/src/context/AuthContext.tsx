import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'admin' | 'manager' | 'farmer' | 'agronomist';
  phone?: string;
  state?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (access: string, refresh: string, user: User) => void;
  logout: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const savedUser = localStorage.getItem('agrisense_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [token, setToken] = useState<string | null>(() =>
    localStorage.getItem('agrisense_access_token')
  );

  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchMe = async () => {
      if (token) {
        try {
          const res = await apiClient.get('/auth/me/');
          setUser(res.data);
          localStorage.setItem('agrisense_user', JSON.stringify(res.data));
        } catch (err) {
          logout();
        }
      }
      setIsLoading(false);
    };

    fetchMe();
  }, [token]);

  const login = (access: string, refresh: string, user: User) => {
    localStorage.setItem('agrisense_access_token', access);
    localStorage.setItem('agrisense_refresh_token', refresh);
    localStorage.setItem('agrisense_user', JSON.stringify(user));
    setToken(access);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('agrisense_access_token');
    localStorage.removeItem('agrisense_refresh_token');
    localStorage.removeItem('agrisense_user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
