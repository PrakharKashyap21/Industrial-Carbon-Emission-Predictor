import api from './api';

export const getOverview = async (params = {}) => {
  try {
    const response = await api.get('/analytics/overview', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch overview KPIs' };
  }
};

export const getEmissionTrend = async (params = {}) => {
  try {
    const response = await api.get('/analytics/emission-trend', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch emission trend' };
  }
};

export const getEmissionIntensity = async (params = {}) => {
  try {
    const response = await api.get('/analytics/emission-intensity', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch emission intensity' };
  }
};

export const getFeatures = async (params = {}) => {
  try {
    const response = await api.get('/analytics/features', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch feature correlations' };
  }
};

export const getAnomalies = async (params = {}) => {
  try {
    const response = await api.get('/analytics/anomalies', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch operational anomalies' };
  }
};

export const getOptimizationImpact = async (params = {}) => {
  try {
    const response = await api.get('/analytics/optimization-impact', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch optimization impact' };
  }
};

export const getInsights = async (params = {}) => {
  try {
    const response = await api.get('/analytics/insights', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch industrial insights' };
  }
};

export const getPlantComparison = async (params = {}) => {
  try {
    const response = await api.get('/analytics/plant-comparison', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch plant comparison' };
  }
};
