import type { DashboardStats, ApiResponse, MerchantStats, PaginatedResponse, Scan } from '../types';
import apiClient from './api';

export const statsService = {
  // Récupérer les statistiques du dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/stats/dashboard');
    return response.data.data!;
  },

  // Récupérer les statistiques d'un commerçant
  getMerchantStats: async (merchantId: string): Promise<MerchantStats> => {
    const response = await apiClient.get<ApiResponse<MerchantStats>>(`/stats/merchant/${merchantId}`);
    return response.data.data!;
  },

  // Récupérer le top des commerçants
  getTopMerchants: async (limit: number = 10): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/stats/merchants/top?limit=${limit}`);
    return response.data.data!;
  },

  // Récupérer l'historique des scans
  getScanHistory: async (
    merchantId: string,
    page: number = 1,
    limit: number = 20
  ): Promise<PaginatedResponse<Scan>> => {
    const response = await apiClient.get<ApiResponse<{ scans: Scan[]; pagination: any }>>(
      `/stats/merchant/${merchantId}/scans?page=${page}&limit=${limit}`
    );
    
    return {
      data: response.data.data!.scans,
      pagination: response.data.data!.pagination,
    };
  },
};