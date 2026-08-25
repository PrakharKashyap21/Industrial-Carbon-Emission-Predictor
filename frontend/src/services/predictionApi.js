import api from './api';

export const createPredictionRecord = async (payload) => {
  try {
    const response = await api.post('/predictions', payload);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to create prediction record',
    };
  }
};

export const getPredictions = async (params = {}) => {
  try {
    const response = await api.get('/predictions', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch prediction history',
    };
  }
};

export const getPredictionById = async (id) => {
  try {
    const response = await api.get(`/predictions/${id}`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch prediction detail',
    };
  }
};

export const updatePredictionActual = async (id, actualCo2) => {
  try {
    const response = await api.patch(`/predictions/${id}/actual`, { actual_co2: actualCo2 });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to update actual emission',
    };
  }
};

export const getPredictionAnalytics = async (params = {}) => {
  try {
    const response = await api.get('/predictions/analytics', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch prediction analytics',
    };
  }
};
