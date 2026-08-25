import api from './api';

// Set request interceptor to automatically attach Bearer token from localStorage
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data?.access_token) {
      localStorage.setItem('token', response.data.access_token);
    }
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Login failed' };
  }
};

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch user profile' };
  }
};

export const logoutUser = async () => {
  try {
    await api.post('/auth/logout');
  } catch (e) {
    // Ignore error on logout
  } finally {
    localStorage.removeItem('token');
  }
};

export const listUsers = async () => {
  try {
    const response = await api.get('/users');
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to list users' };
  }
};

export const createUser = async (userData) => {
  try {
    const response = await api.post('/users', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to create user' };
  }
};

export const updateUserStatus = async (userId, isActive) => {
  try {
    const response = await api.put(`/users/${userId}/status`, { is_active: isActive });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to update user status' };
  }
};

export const getAuditLogs = async (params = {}) => {
  try {
    const response = await api.get('/audit/logs', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch audit logs' };
  }
};
