import type { MerchantFilters, PaginatedResponse, Merchant, ApiResponse, CreateMerchantData } from '../types';
import apiClient from './api';


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
    
    return {
      data: response.data.data!.merchants,
      pagination: response.data.data!.pagination,
    };
  },

  // Récupérer un commerçant par ID
  getById: async (id: string): Promise<Merchant> => {
    const response = await apiClient.get<ApiResponse<Merchant>>(`/merchants/${id}`);
    return response.data.data!;
  },

  // Créer un nouveau commerçant
  create: async (data: CreateMerchantData, logo?: File): Promise<Merchant> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    if (logo) {
      formData.append('logo', logo);
    }

    const response = await apiClient.post<ApiResponse<Merchant>>('/merchants', formData);
    
    return response.data.data!;
  },

  // Mettre à jour un commerçant
  update: async (id: string, data: Partial<CreateMerchantData>, logo?: File): Promise<Merchant> => {
    const formData = new FormData();
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, value.toString());
      }
    });
    
    if (logo) {
      formData.append('logo', logo);
    }

    const response = await apiClient.put<ApiResponse<Merchant>>(`/merchants/${id}`, formData);
    
    return response.data.data!;
  },

  // Supprimer un commerçant
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/merchants/${id}`);
  },

  // Activer/Désactiver un commerçant
  toggleStatus: async (id: string): Promise<Merchant> => {
    const response = await apiClient.patch<ApiResponse<Merchant>>(`/merchants/${id}/toggle-status`);
    return response.data.data!;
  },
};