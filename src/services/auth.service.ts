import type { LoginCredentials, AuthResponse, ApiResponse, RegisterData, User } from '../types';
import apiClient from './api';

export const authService = {
  // Connexion
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
    const { user, token } = response.data.data!;
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data!;
  },

  // Inscription
  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await apiClient.post<ApiResponse<AuthResponse>>('/auth/register', data);
    const { user, token } = response.data.data!;
    
    // Sauvegarder dans le localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data.data!;
  },

  // Récupérer le profil
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ApiResponse<User>>('/auth/profile');
    return response.data.data!;
  },

  // Mettre à jour le profil
  updateProfile: async (data: { firstName: string; lastName: string }): Promise<User> => {
    const response = await apiClient.put<ApiResponse<User>>('/auth/profile', data);
    
    // Mettre à jour le localStorage
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...user, ...response.data.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return response.data.data!;
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