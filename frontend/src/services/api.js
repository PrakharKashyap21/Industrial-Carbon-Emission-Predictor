import axios from 'axios';

// Obtain API Base URL from Vite environment variable with production Render fallback
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://industrial-carbon-emission-predictor-3.onrender.com/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Perform backend health check API call.
 * GET /api/health
 */
export const getHealthCheck = async () => {
  const startTime = Date.now();
  try {
    const response = await apiClient.get('/health');
    const latency = Date.now() - startTime;
    return {
      success: true,
      data: response.data,
      latency,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    let message = 'Unable to connect to backend service.';
    if (error.response) {
      message = `Backend returned status ${error.response.status}`;
    } else if (error.request) {
      message = 'Backend service is offline or unreachable.';
    } else {
      message = error.message;
    }

    return {
      success: false,
      error: message,
      latency,
      timestamp: new Date().toLocaleTimeString(),
    };
  }
};

/**
 * Retrieve list of registered industrial plants.
 * GET /api/plants
 */
export const getPlants = async () => {
  try {
    const response = await apiClient.get('/plants');
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
};

/**
 * Retrieve paginated industrial readings.
 * GET /api/readings
 */
export const getReadings = async (page = 1, pageSize = 10, plantId = null) => {
  try {
    const params = { page, page_size: pageSize };
    if (plantId) params.plant_id = plantId;
    const response = await apiClient.get('/readings', { params });
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
};

/**
 * Generate preview predictions using RF, XGBoost, and Ensemble models.
 * POST /api/predictions/preview
 */
export const predictCO2Preview = async (payload) => {
  try {
    const response = await apiClient.post('/predictions/preview', payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
};

/**
 * Generate SHAP prediction explanation.
 * POST /api/explanations/prediction
 */
export const getPredictionExplanation = async (payload) => {
  try {
    const response = await apiClient.post('/explanations/prediction', payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
};

/**
 * Run single scenario what-if analysis.
 * POST /api/what-if/analyze
 */
export const analyzeScenario = async (payload) => {
  try {
    const response = await apiClient.post('/what-if/analyze', payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
};

/**
 * Run batch scenario what-if analysis.
 * POST /api/what-if/analyze-batch
 */
export const analyzeBatchScenarios = async (payload) => {
  try {
    const response = await apiClient.post('/what-if/analyze-batch', payload);
    return {
      success: true,
      data: response.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.detail || error.message,
    };
  }
};

export default apiClient;
