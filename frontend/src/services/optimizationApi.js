import api, { formatErrorMessage } from './api';

export const runOptimization = async (payload) => {
  try {
    const response = await api.post('/optimization/run', payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: formatErrorMessage(error, 'Optimization Search Failed. Please check parameters or server status.'),
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
      error: formatErrorMessage(error, 'Failed to fetch optimization history'),
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
      error: formatErrorMessage(error, 'Failed to fetch candidate audit log'),
    };
  }
};
