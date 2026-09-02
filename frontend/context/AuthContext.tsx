'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '@/types';
import { api } from '@/lib/axios';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('logiq_token');
      if (token) {
        try {
          // Replace with your actual backend route to fetch current user
          const res = await api.get('/auth/me');
          setUser(res.data.data);
        } catch (error) {
          localStorage.removeItem('logiq_token');
        }
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  const login = (token: string, userData: User) => {
    localStorage.setItem('logiq_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('logiq_token');
    setUser(null);
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};