
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
  });

  useEffect(() => {
    const storedUser = localStorage.getItem('libsys_current_user');
    if (storedUser) {
      setAuth({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
      });
    }
  }, []);

  const login = (user: User) => {
    localStorage.setItem('libsys_current_user', JSON.stringify(user));
    setAuth({ user, isAuthenticated: true });
  };

  const logout = () => {
    localStorage.removeItem('libsys_current_user');
    setAuth({ user: null, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...auth, login, logout }}>
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
