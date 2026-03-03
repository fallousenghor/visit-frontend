import type { MerchantFilters, PaginatedResponse, Merchant, ApiResponse, CreateMerchantData } from '../types';
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

export const merchantService = {
  // Récupérer tous les commerçants avec pagination et filtres
  getAll: async (filters?: MerchantFilters): Promise<PaginatedResponse<Merchant>> => {
    const params = new URLSearchParams();
    
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.search) params.append('search', filters.search);
    if (filters?.isActive !== undefined) params.append('isActive', filters.isActive.toString());
    if (filters?.city) params.append('city', filters.city);

    const response = await apiClient.get<ApiResponse<{ merchants: Merchant[]; pagination: any }>>(
      `/merchants?${params.toString()}`
    );
    
    const data = getResponseData(response);
    
    return {
      data: data.merchants,
      pagination: data.pagination,
    };
  },

  // Récupérer un commerçant par ID
  getById: async (id: string): Promise<Merchant> => {
    const response = await apiClient.get<ApiResponse<Merchant>>(`/merchants/${id}`);
    return getResponseData(response);
  },

  // Créer un nouveau commerçant
  create: async (data: CreateMerchantData, logo?: File, cv?: File): Promise<Merchant> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    if (logo) {
      formData.append('logo', logo);
    }

    if (cv) {
      formData.append('cv', cv);
    }

    const response = await apiClient.post<ApiResponse<Merchant>>('/merchants', formData);
    
    return getResponseData(response);
  },

  // Mettre à jour un commerçant
  update: async (id: string, data: Partial<CreateMerchantData>, logo?: File, cv?: File): Promise<Merchant> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    if (logo) {
      formData.append('logo', logo);
    }

    if (cv) {
      formData.append('cv', cv);
    }

    const response = await apiClient.put<ApiResponse<Merchant>>(`/merchants/${id}`, formData);
    
    return getResponseData(response);
  },

  // Supprimer un commerçant
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/merchants/${id}`);
  },

  // Activer/Désactiver un commerçant
  toggleStatus: async (id: string): Promise<Merchant> => {
    const response = await apiClient.patch<ApiResponse<Merchant>>(`/merchants/${id}/toggle-status`);
    return getResponseData(response);
  },
};
