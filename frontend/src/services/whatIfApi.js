import api, { formatErrorMessage } from './api.js';

export const predictScenario = async (payload) => {
  try {
    const response = await api.post('/what-if/predict', payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: formatErrorMessage(error, 'Failed to simulate scenario'),
    };
  }
};

export const compareScenarios = async (payload) => {
  try {
    const response = await api.post('/what-if/compare', payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: formatErrorMessage(error, 'Failed to compare scenarios'),
    };
  }
};

export const analyzeSensitivity = async (payload) => {
  try {
    const response = await api.post('/what-if/sensitivity', payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: formatErrorMessage(error, 'Failed to run sensitivity analysis'),
    };
  }
};

export const saveScenario = async (payload) => {
  try {
    const response = await api.post('/what-if/save', payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: formatErrorMessage(error, 'Failed to save scenario'),
    };
  }
};

export const getSavedScenarios = async (params = {}) => {
  try {
    const response = await api.get('/what-if/scenarios', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: formatErrorMessage(error, 'Failed to fetch saved scenarios'),
    };
  }
};
