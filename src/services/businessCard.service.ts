import type { CreateBusinessCardData, BusinessCard, ApiResponse } from '../types';
import apiClient from './api';

export const businessCardService = {
  // Créer une nouvelle carte de visite
  create: async (data: CreateBusinessCardData): Promise<BusinessCard> => {
    const response = await apiClient.post<ApiResponse<BusinessCard>>('/cards', data);
    return response.data.data!;
  },

  // Récupérer la carte d'un commerçant
  getByMerchantId: async (merchantId: string): Promise<BusinessCard> => {
    const response = await apiClient.get<ApiResponse<BusinessCard>>(`/cards/merchant/${merchantId}`);
    return response.data.data!;
  },

  // Scanner une carte (route publique)
  scanCard: async (qrCode: string): Promise<BusinessCard> => {
    const response = await apiClient.get<ApiResponse<BusinessCard>>(`/cards/scan/${qrCode}`);
    return response.data.data!;
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
    return response.data.data!;
  },

  // Régénérer le QR code
  regenerateQRCode: async (id: string): Promise<BusinessCard> => {
    const response = await apiClient.post<ApiResponse<BusinessCard>>(`/cards/${id}/regenerate`);
    return response.data.data!;
  },

  // Renouveler une carte
  renewCard: async (id: string, months: number = 12): Promise<BusinessCard> => {
    const response = await apiClient.post<ApiResponse<BusinessCard>>(`/cards/${id}/renew`, {
      months,
    });
    return response.data.data!;
  },

  // Supprimer une carte
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/cards/${id}`);
  },
};