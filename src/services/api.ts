import { message } from 'antd';
import axios, { type AxiosInstance, AxiosError, type AxiosResponse } from 'axios';

// Get API URL from environment variable or use default
const getApiUrl = (): string => {
  // For production on Vercel, use the environment variable
  if (import.meta.env.PROD) {
    return import.meta.env.VITE_API_URL || 'https://visit-backend-2.onrender.com/api/v1';
  }
  // For development, allow override or use default
  return import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';
};

const API_URL = getApiUrl();

// Create Axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // For FormData, don't set Content-Type (browser does it automatically with boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error: AxiosError<any>) => {
    if (error.response) {
      const { status, data } = error.response;

      switch (status) {
        case 401:
          message.error('Session expirée. Veuillez vous reconnecter.');
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
          break;
        case 403:
          message.error('Accès interdit');
          break;
        case 404:
          message.error(data?.message || 'Ressource non trouvée');
          break;
        case 500:
          message.error('Erreur serveur. Veuillez réessayer plus tard.');
          break;
        default:
          message.error(data?.message || 'Une erreur est survenue');
      }
    } else if (error.request) {
      message.error('Impossible de contacter le serveur');
    } else {
      message.error('Une erreur est survenue');
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// Export API URL for debugging
export { API_URL };

