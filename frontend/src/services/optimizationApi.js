import api from './api';

export const runOptimization = async (payload) => {
  try {
    const response = await api.post('/optimization/run', payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to run optimization search',
    };
  }
};

export const getOptimizationHistory = async (params = {}) => {
  try {
    const response = await api.get('/optimization/history', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch optimization history',
    };
  }
};

export const getOptimizationCandidates = async (optimizationId) => {
  try {
    const response = await api.get(`/optimization/${optimizationId}/candidates`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch candidate audit log',
    };
  }
};
