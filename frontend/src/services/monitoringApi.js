import api from './api';

export const runMonitoringCycle = async (params = {}) => {
  try {
    const response = await api.post('/monitoring/run', null, { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to execute monitoring run',
    };
  }
};

export const getMonitoringOverview = async (params = {}) => {
  try {
    const response = await api.get('/monitoring/overview', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch monitoring overview',
    };
  }
};

export const getDataQualityMetrics = async (params = {}) => {
  try {
    const response = await api.get('/monitoring/data-quality', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch data quality metrics',
    };
  }
};

export const getDriftResults = async (params = {}) => {
  try {
    const response = await api.get('/monitoring/drift', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch data drift results',
    };
  }
};

export const getPerformanceMetrics = async (params = {}) => {
  try {
    const response = await api.get('/monitoring/performance', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch model performance metrics',
    };
  }
};

export const getReliabilityAssessment = async (params = {}) => {
  try {
    const response = await api.get('/monitoring/reliability', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch reliability assessment',
    };
  }
};

export const getMonitoringAlerts = async (params = {}) => {
  try {
    const response = await api.get('/monitoring/alerts', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch monitoring alerts',
    };
  }
};

export const acknowledgeMonitoringAlert = async (id) => {
  try {
    const response = await api.patch(`/monitoring/alerts/${id}/acknowledge`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to acknowledge alert',
    };
  }
};

export const resolveMonitoringAlert = async (id) => {
  try {
    const response = await api.patch(`/monitoring/alerts/${id}/resolve`);
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to resolve alert',
    };
  }
};
