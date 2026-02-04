// Types pour l'authentification
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'AGENT';
  isActive: boolean;
  createdAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Types pour les commerçants
export interface Merchant {
  id: string;
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  whatsappNumber?: string;
  email?: string;
  description?: string;
  category?: string;
  address?: string;
  city: string;
  country: string;
  latitude?: number;
  longitude?: number;
  logo?: string;
  coverImage?: string;
  primaryColor?: string;
  secondaryColor?: string;
  useGradient?: boolean;
  isActive: boolean;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
  businessCard?: BusinessCard;
  openingHours?: OpeningHours[];
  paymentMethods?: PaymentMethod[];
  _count?: {
    scans: number;
    subscriptions: number;
  };
}

export interface CreateMerchantData {
  businessName: string;
  ownerName: string;
  phoneNumber: string;
  whatsappNumber?: string;
  email?: string;
  description?: string;
  category?: string;
  address?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  primaryColor?: string;
  secondaryColor?: string;
  useGradient?: boolean;
}

// Types pour les cartes de visite
export interface BusinessCard {
  id: string;
  merchantId: string;
  qrCode: string;
  qrCodeImage: string;
  nfcEnabled: boolean;
  nfcTag?: string;
  cardType: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  publicUrl: string;
  isActive: boolean;
  activatedAt: string;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  merchant?: Merchant;
}

export interface CreateBusinessCardData {
  merchantId: string;
  cardType?: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  nfcEnabled?: boolean;
}

// Types pour les horaires
export interface OpeningHours {
  id: string;
  merchantId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isClosed: boolean;
}

// Types pour les moyens de paiement
export interface PaymentMethod {
  id: string;
  merchantId: string;
  paymentMethod: 'WAVE' | 'ORANGE_MONEY' | 'BANK_CARD' | 'CASH';
  accountNumber: string;
  accountName: string;
  isActive: boolean;
  createdAt: string;
}

// Types pour les abonnements
export interface Subscription {
  id: string;
  merchantId: string;
  packType: 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  status: 'ACTIVE' | 'EXPIRED' | 'CANCELLED' | 'PENDING';
  price: number;
  startDate: string;
  endDate: string;
  autoRenew: boolean;
  paymentMethod?: string;
  createdAt: string;
  updatedAt: string;
}

// Types pour les statistiques
export interface DashboardStats {
  totalMerchants: number;
  activeMerchants: number;
  totalScans: number;
  totalRevenue: number;
  recentMerchants: Merchant[];
  recentScans: Scan[];
}

export interface MerchantStats {
  totalScans: number;
  scansToday: number;
  scansThisWeek: number;
  scansThisMonth: number;
  scansByDay: Array<{ date: string; count: number }>;
  scansByDevice: Array<{ deviceType: string; count: number }>;
}

export interface Scan {
  id: string;
  merchantId: string;
  scannedAt: string;
  userAgent?: string;
  ipAddress?: string;
  deviceType?: string;
  location?: string;
  merchant?: {
    id: string;
    businessName: string;
    city: string;
  };
}

// Types pour les réponses API
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Types pour les filtres
export interface MerchantFilters {
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
  city?: string;
}