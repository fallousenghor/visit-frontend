import type { LoginCredentials, AuthResponse, ApiResponse, RegisterData, User } from '../types';
import apiClient from './api';

// Helper function to safely extract data from response
const getResponseData = <T>(response: { data: ApiResponse<T> }): T => {
  if (!response.data) {
    throw new Error('Invalid response: no data');
  }
  if (!response.data.success && response.data.error) {
    throw new Error(response.data.error);
  }
  if (response.data.data === undefined || response.data.data === null) {
    throw new Error('Invalid response: data is undefined or null');
  }
  return response.data.data;
};

export const authService = {
  // Connexion
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const authData = getResponseData(response);
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    
    return authData;
  },

  // Inscription
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const authData = getResponseData(response);
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('token', authData.token);
    localStorage.setItem('user', JSON.stringify(authData.user));
    
    return authData;
  },

  // Récupérer le profil
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return getResponseData(response);
  },

  // Mettre à jour le profil
  updateProfile: async (data: { firstName: string; lastName: string }): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    const updatedUser = getResponseData(response);
    
    // Mettre à jour le localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const mergedUser = { ...user, ...updatedUser };
    localStorage.setItem('user', JSON.stringify(mergedUser));
    
    return updatedUser;
  },

  // Changer le mot de passe
  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    await apiClient.put('/auth/change-password', data);
  },

  // Déconnexion
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // Vérifier si l'utilisateur est connecté
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Récupérer l'utilisateur actuel
  getCurrentUser: (): User | null => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};
