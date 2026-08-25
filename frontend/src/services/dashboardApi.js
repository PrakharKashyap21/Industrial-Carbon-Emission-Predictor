import api from './api';

export const getDashboardOverview = async (plantId = null, days = 30) => {
  try {
    const params = { days };
    if (plantId) params.plant_id = plantId;
    const response = await api.get('/dashboard/overview', { params });
    return { success: true, data: response.data };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message || 'Failed to fetch dashboard data',
    };
  }
};
