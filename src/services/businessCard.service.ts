import type { CreateBusinessCardData, BusinessCard, ApiResponse } from '../types';
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

export const businessCardService = {
  // Créer une nouvelle carte de visite
  create: async (data: CreateBusinessCardData): Promise<BusinessCard> => {
    const response = await apiClient.post<ApiResponse<BusinessCard>>('/cards', data);
    return getResponseData(response);
  },

  // Récupérer la carte d'un commerçant
  getByMerchantId: async (merchantId: string): Promise<BusinessCard> => {
    const response = await apiClient.get<ApiResponse<BusinessCard>>(`/cards/merchant/${merchantId}`);
    return getResponseData(response);
  },

  // Scanner une carte (route publique)
  scanCard: async (qrCode: string): Promise<BusinessCard> => {
    const response = await apiClient.get<ApiResponse<BusinessCard>>(`/cards/scan/${qrCode}`);
    return getResponseData(response);
  },

  // Mettre à jour une carte
  update: async (
    id: string,
    data: {
      cardType?: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
      nfcEnabled?: boolean;
      isActive?: boolean;
    }
  ): Promise<BusinessCard> => {
    const response = await apiClient.put<ApiResponse<BusinessCard>>(`/cards/${id}`, data);
    return getResponseData(response);
  },

  // Régénérer le QR code
  regenerateQRCode: async (id: string): Promise<BusinessCard> => {
    const response = await apiClient.post<ApiResponse<BusinessCard>>(`/cards/${id}/regenerate`);
    return getResponseData(response);
  },

  // Renouveler une carte
  renewCard: async (id: string, months: number = 12): Promise<BusinessCard> => {
    const response = await apiClient.post<ApiResponse<BusinessCard>>(`/cards/${id}/renew`, {
      months,
    });
    return getResponseData(response);
  },

  // Supprimer une carte
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/cards/${id}`);
  },
};
