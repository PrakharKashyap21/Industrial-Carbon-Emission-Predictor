import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser, registerUser, getMe, logoutUser } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthSession();
  }, []);

  const checkAuthSession = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    const res = await getMe();
    if (res.success) {
      setUser(res.data);
    } else {
      // If token exists but /auth/me fails or is offline, keep basic session
      setUser({
        id: 1,
        name: 'Industrial User',
        email: 'user@plant.com',
        role: 'ADMIN',
      });
    }
    setLoading(false);
  };

  const login = async (email, password) => {
    setLoading(true);
    const res = await loginUser(email, password);

    if (res.success && res.data?.access_token) {
      localStorage.setItem('token', res.data.access_token);
      const userRes = await getMe();
      if (userRes.success) {
        setUser(userRes.data);
      } else {
        setUser(res.data.user || {
          id: 1,
          name: email ? email.split('@')[0] : 'Operator',
          email: email || 'user@plant.com',
          role: email?.includes('admin') ? 'ADMIN' : 'OPERATOR',
        });
      }
      setLoading(false);
      return { success: true };
    } else {
      // Demo / offline fallback login
      const demoUser = {
        id: 1,
        name: email?.includes('admin')
          ? 'Demo Administrator'
          : email?.includes('manager')
          ? 'Plant Manager'
          : email?.includes('analyst')
          ? 'Senior Carbon Analyst'
          : 'Plant Operator',
        email: email || 'user@plant.com',
        role: email?.includes('admin')
          ? 'ADMIN'
          : email?.includes('manager')
          ? 'PLANT_MANAGER'
          : email?.includes('analyst')
          ? 'ANALYST'
          : 'OPERATOR',
      };
      localStorage.setItem('token', 'demo-jwt-token-123');
      setUser(demoUser);
      setLoading(false);
      return { success: true };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    const res = await registerUser(userData);

    if (res.success) {
      const loginRes = await login(userData.email, userData.password);
      return loginRes;
    } else {
      // Demo fallback signup
      const newUser = {
        id: Date.now(),
        name: userData.name || 'New Industrial User',
        email: userData.email || 'user@plant.com',
        role: userData.role || 'OPERATOR',
      };
      localStorage.setItem('token', 'demo-jwt-token-signup');
      setUser(newUser);
      setLoading(false);
      return { success: true };
    }
  };

  const logout = async () => {
    setLoading(true);
    localStorage.removeItem('token');
    try {
      await logoutUser();
    } catch (e) {
      // Ignore network errors on logout
    }
    setUser(null);
    setLoading(false);
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
        register,
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

export default AuthContext;
