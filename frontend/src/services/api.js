import axios from 'axios';

// Obtain API Base URL from Vite environment variable with production Render fallback
const rawBaseUrl = import.meta?.env?.VITE_API_BASE_URL || 'https://industrial-carbon-emission-predictor-3.onrender.com/api';
const cleanBaseUrl = rawBaseUrl.replace(/\/+$/, '');
const API_BASE_URL = cleanBaseUrl.endsWith('/api') ? cleanBaseUrl : `${cleanBaseUrl}/api`;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

/**
 * Safely extract a clean string error message from any error or response object.
 * Guarantees NO "JSON.stringify cannot serialize cyclic structures" errors.
 */
export const formatErrorMessage = (error, defaultFallback = 'An unexpected error occurred.') => {
  if (!error) return defaultFallback;

  // 1. If it's already a simple string, return it directly
  if (typeof error === 'string') return error;

  // 2. Extract detail from Axios error response if available
  if (error.response?.data?.detail) {
    const detail = error.response.data.detail;
    if (typeof detail === 'string') {
      return detail;
    }
    if (Array.isArray(detail)) {
      return detail
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const locStr = Array.isArray(item.loc) ? item.loc.join('.') : '';
            return item.msg ? (locStr ? `${locStr}: ${item.msg}` : item.msg) : (item.message || 'Validation error');
          }
          return String(item);
        })
        .join(' | ');
    }
    if (typeof detail === 'object' && detail !== null) {
      if (detail.msg) return String(detail.msg);
      if (detail.message) return String(detail.message);
    }
  }

  // 3. Check for standard Error instance message
  if (error.message && typeof error.message === 'string') {
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      return 'Request timed out. The service is taking longer than expected to respond. Please try again.';
    }
    return error.message;
  }

  // 4. Check HTTP status code
  if (error.response?.status) {
    return `Server returned status ${error.response.status}.`;
  }

  // 5. Fallback safe string conversion without calling JSON.stringify on raw cyclic objects
  try {
    const str = String(error);
    if (str && str !== '[object Object]') return str;
  } catch (e) {
    // Ignore stringify errors
  }

  return defaultFallback;
};

/**
 * Perform backend health check API call with short 5s timeout.
 * GET /api/health
 */
export const getHealthCheck = async () => {
  const startTime = Date.now();
  try {
    const response = await apiClient.get('/health', { timeout: 5000 });
    const latency = Date.now() - startTime;
    return {
      success: true,
      data: response.data,
      latency,
      timestamp: new Date().toLocaleTimeString(),
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    return {
      success: false,
      error: formatErrorMessage(error, 'Unable to connect to backend service.'),
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
      error: formatErrorMessage(error, 'Failed to fetch plant list'),
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
      error: formatErrorMessage(error, 'Failed to fetch industrial readings'),
    };
  }
};

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
      error: formatErrorMessage(error, 'Prediction service is temporarily unavailable. Please try again.'),
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
      error: formatErrorMessage(error, 'Failed to generate SHAP explanation'),
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
      error: formatErrorMessage(error, 'Failed to analyze scenario'),
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
      error: formatErrorMessage(error, 'Failed to analyze batch scenarios'),
    };
  }
};

export default apiClient;
