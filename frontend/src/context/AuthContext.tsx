'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '@/types';
import api from '@/lib/api';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (data: any) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  demoLogin: (role: UserRole) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const refreshUser = async () => {
    try {
      const storedToken = localStorage.getItem('pgmate_token');
      if (!storedToken) {
        setIsLoading(false);
        return;
      }
      setToken(storedToken);
      const res = await api.get('/auth/me');
      if (res.data.success) {
        setUser(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch user session:', err);
      localStorage.removeItem('pgmate_token');
      setUser(null);
      setToken(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      const { token: receivedToken, user: receivedUser } = res.data.data;
      localStorage.setItem('pgmate_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any): Promise<User> => {
    setIsLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { token: receivedToken, user: receivedUser } = res.data.data;
      localStorage.setItem('pgmate_token', receivedToken);
      setToken(receivedToken);
      setUser(receivedUser);
      return receivedUser;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pgmate_token');
    setUser(null);
    setToken(null);
    router.push('/login');
  };

  const demoLogin = async (role: UserRole) => {
    let email = 'student@pgmate.com';
    let pass = 'student123';
    let redirectPath = '/student/dashboard';

    if (role === 'OWNER') {
      email = 'owner@pgmate.com';
      pass = 'owner123';
      redirectPath = '/owner/dashboard';
    } else if (role === 'ADMIN') {
      email = 'admin@pgmate.com';
      pass = 'admin123';
      redirectPath = '/admin/dashboard';
    }

    const loggedInUser = await login(email, pass);
    if (loggedInUser.role === 'OWNER') {
      router.push('/owner/dashboard');
    } else if (loggedInUser.role === 'ADMIN') {
      router.push('/admin/dashboard');
    } else {
      router.push('/student/dashboard');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        demoLogin,
      }}
    >
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
