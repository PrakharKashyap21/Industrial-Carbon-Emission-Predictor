import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, getMe, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState({
    id: 'admin-1',
    name: 'Demo Administrator',
    email: 'admin@industrial.ai',
    role: 'ADMIN',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      // Auto-set demo admin user if no token exists so login is bypassed
      setUser({
        id: 'admin-1',
        name: 'Demo Administrator',
        email: 'admin@industrial.ai',
        role: 'ADMIN',
      });
      setLoading(false);
      return;
    }

    const res = await getMe();
    if (res.success) {
      setUser(res.data);
    } else {
      setUser({
        id: 'admin-1',
        name: 'Demo Administrator',
        email: 'admin@industrial.ai',
        role: 'ADMIN',
      });
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    const res = await loginUser(email, password);
    if (res.success) {
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error };
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  const role = user?.role || 'OPERATOR';
  const isAuthenticated = !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated,
        loading,
        login,
        logout,
        refreshUser: checkAuthSession,
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
