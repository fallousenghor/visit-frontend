import type { DashboardStats, ApiResponse, MerchantStats, PaginatedResponse, Scan } from '../types';
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

export const statsService = {
  // Récupérer les statistiques du dashboard
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await apiClient.get<ApiResponse<DashboardStats>>('/stats/dashboard');
    return getResponseData(response);
  },

  // Récupérer les statistiques d'un commerçant
  getMerchantStats: async (merchantId: string): Promise<MerchantStats> => {
    const response = await apiClient.get<ApiResponse<MerchantStats>>(`/stats/merchant/${merchantId}`);
    return getResponseData(response);
  },

  // Récupérer le top des commerçants
  getTopMerchants: async (limit: number = 10): Promise<any[]> => {
    const response = await apiClient.get<ApiResponse<any[]>>(`/stats/merchants/top?limit=${limit}`);
    return getResponseData(response);
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
    
    const data = getResponseData(response);
    
    return {
      data: data.scans,
      pagination: data.pagination,
    };
  },
};
