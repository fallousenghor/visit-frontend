import { message } from 'antd';
import axios, { type AxiosInstance, AxiosError, type AxiosResponse } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://visit-backend-2.onrender.com/api/v1';

// Créer une instance Axios
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur de requête
apiClient.interceptors.request.use(
  (config: any) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Pour FormData, ne pas fixer le Content-Type (le navigateur le fait automatiquement avec le boundary)
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Intercepteur de réponse
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