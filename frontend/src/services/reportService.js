import api from './api';

export const generateReport = async (reportData) => {
  try {
    const response = await api.post('/reports/generate', reportData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Report generation failed' };
  }
};

export const previewReport = async (previewData) => {
  try {
    const response = await api.post('/reports/preview', previewData);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Report preview failed' };
  }
};

export const listReports = async (params = {}) => {
  try {
    const response = await api.get('/reports', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch report history' };
  }
};

export const getReportById = async (reportId) => {
  try {
    const response = await api.get(`/reports/${reportId}`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error: error.response?.data?.detail || error.message || 'Failed to fetch report details' };
  }
};

export const downloadReportFile = async (reportId, filename = 'report_export') => {
  try {
    const response = await api.get(`/reports/${reportId}/download`, {
      responseType: 'blob',
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    return { success: true };
  } catch (error) {
    return { success: false, error: 'Failed to download report file' };
  }
};
