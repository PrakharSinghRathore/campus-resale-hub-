import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add Firebase ID token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const user = auth.currentUser;
      if (user) {
        const idToken = await user.getIdToken();
        config.headers.Authorization = `Bearer ${idToken}`;
      }
    } catch (error) {
      console.error('Error getting ID token:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      console.error('Authentication error:', error.response.data);
      // You can dispatch a logout action here if using global state
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const api = {
  // Auth
  auth: {
    verifyToken: () => apiClient.post('/auth/verify'),
    getCurrentUser: () => apiClient.get('/auth/me'),
  },

  // Users
  users: {
    getProfile: () => apiClient.get('/users/profile'),
    updateProfile: (data: any) => apiClient.put('/users/profile', data),
    getUserById: (id: string) => apiClient.get(`/users/${id}`),
  },

  // Listings
  listings: {
    getAll: (params?: any) => apiClient.get('/listings', { params }),
    getById: (id: string) => apiClient.get(`/listings/${id}`),
    create: (data: any) => apiClient.post('/listings', data),
    update: (id: string, data: any) => apiClient.put(`/listings/${id}`, data),
    delete: (id: string) => apiClient.delete(`/listings/${id}`),
    getUserListings: () => apiClient.get('/listings/my'),
    toggleFavorite: (id: string) => apiClient.post(`/listings/${id}/favorite`),
    getFavorites: () => apiClient.get('/listings/favorites'),
    initiatePurchase: (id: string) => apiClient.post(`/listings/${id}/purchase/initiate`),
    verifyPurchase: (id: string, code: string) => apiClient.post(`/listings/${id}/purchase/verify`, { code }),
  },

  // Chats
  chats: {
    getAll: () => apiClient.get('/chats'),
    getById: (id: string) => apiClient.get(`/chats/${id}`),
    create: (data: any) => apiClient.post('/chats', data),
    getOrCreate: (participantId: string) => apiClient.post('/chats/with', { participantId }),
  },

  // Messages
  messages: {
    getChatMessages: (chatId: string) => apiClient.get(`/chats/${chatId}/messages`),
    sendMessage: (chatId: string, data: any) => apiClient.post(`/chats/${chatId}/messages`, data),
    markAsRead: (chatId: string) => apiClient.put(`/chats/${chatId}/read`),
  },

  // Admin (if user is admin)
  admin: {
    getUsers: () => apiClient.get('/admin/users'),
    getUserById: (id: string) => apiClient.get(`/admin/users/${id}`),
    updateUser: (id: string, data: any) => apiClient.put(`/admin/users/${id}`, data),
    deleteUser: (id: string) => apiClient.delete(`/admin/users/${id}`),
    getListings: () => apiClient.get('/admin/listings'),
    updateListing: (id: string, data: any) => apiClient.put(`/admin/listings/${id}`, data),
    deleteListing: (id: string) => apiClient.delete(`/admin/listings/${id}`),
    getStats: () => apiClient.get('/admin/stats'),
  },
};

export default apiClient;