import { create } from 'zustand';
import type { Merchant, MerchantFilters, CreateMerchantData } from '../types';
import { merchantService } from '../services/merchant.service';

interface MerchantState {
  merchants: Merchant[];
  currentMerchant: Merchant | null;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  filters: MerchantFilters;

  // Actions
  fetchMerchants: (filters?: MerchantFilters) => Promise<void>;
  fetchMerchantById: (id: string) => Promise<void>;
  createMerchant: (data: CreateMerchantData, logo?: File) => Promise<Merchant>;
  updateMerchant: (id: string, data: Partial<CreateMerchantData>, logo?: File) => Promise<void>;
  deleteMerchant: (id: string) => Promise<void>;
  toggleMerchantStatus: (id: string) => Promise<void>;
  setFilters: (filters: MerchantFilters) => void;
  clearError: () => void;
  setCurrentMerchant: (merchant: Merchant | null) => void;
}

export const useMerchantStore = create<MerchantState>((set, get) => ({
  merchants: [],
  currentMerchant: null,
  total: 0,
  page: 1,
  limit: 10,
  totalPages: 0,
  isLoading: false,
  error: null,
  filters: {},

  fetchMerchants: async (filters?: MerchantFilters) => {
    set({ isLoading: true, error: null });
    try {
      const finalFilters = filters || get().filters;
      const { data, pagination } = await merchantService.getAll(finalFilters);
      
      set({
        merchants: data,
        total: pagination.total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: pagination.totalPages,
        filters: finalFilters,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement',
        isLoading: false,
      });
      throw error;
    }
  },

  fetchMerchantById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const merchant = await merchantService.getById(id);
      set({
        currentMerchant: merchant,
        isLoading: false,
      });
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors du chargement',
        isLoading: false,
      });
      throw error;
    }
  },

  createMerchant: async (data: CreateMerchantData, logo?: File) => {
    set({ isLoading: true, error: null });
    try {
      const merchant = await merchantService.create(data, logo);
      set((state) => ({
        merchants: [merchant, ...state.merchants],
        total: state.total + 1,
        isLoading: false,
      }));
      return merchant;
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors de la création',
        isLoading: false,
      });
      throw error;
    }
  },

  updateMerchant: async (id: string, data: Partial<CreateMerchantData>, logo?: File) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMerchant = await merchantService.update(id, data, logo);
      
      set((state) => ({
        merchants: state.merchants.map((m) => (m.id === id ? updatedMerchant : m)),
        currentMerchant:
          state.currentMerchant?.id === id ? updatedMerchant : state.currentMerchant,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors de la mise à jour',
        isLoading: false,
      });
      throw error;
    }
  },

  deleteMerchant: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await merchantService.delete(id);
      
      set((state) => ({
        merchants: state.merchants.filter((m) => m.id !== id),
        total: state.total - 1,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors de la suppression',
        isLoading: false,
      });
      throw error;
    }
  },

  toggleMerchantStatus: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const updatedMerchant = await merchantService.toggleStatus(id);
      
      set((state) => ({
        merchants: state.merchants.map((m) => (m.id === id ? updatedMerchant : m)),
        currentMerchant:
          state.currentMerchant?.id === id ? updatedMerchant : state.currentMerchant,
        isLoading: false,
      }));
    } catch (error: any) {
      set({
        error: error.response?.data?.message || 'Erreur lors du changement de statut',
        isLoading: false,
      });
      throw error;
    }
  },

  setFilters: (filters: MerchantFilters) => {
    set({ filters });
  },

  clearError: () => set({ error: null }),

  setCurrentMerchant: (merchant: Merchant | null) => {
    set({ currentMerchant: merchant });
  },
}));