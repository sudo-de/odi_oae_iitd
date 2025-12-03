import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'http://localhost:3000';

// Create axios instance with interceptors
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('userData');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Auth
  async getProfile() {
    const response = await apiClient.get('/auth/profile');
    return response.data;
  },

  // Ride Bills
  async getRideBills() {
    const response = await apiClient.get('/ride-bills');
    return response.data;
  },

  async getRideBillStats() {
    const response = await apiClient.get('/ride-bills/stats');
    return response.data;
  },

  // Driver QR Code
  async generateQRCode(driverId: string) {
    const response = await apiClient.post(`/users/${driverId}/generate-qr`);
    return response.data.qrCode;
  },

  // Ride Locations
  async getRideLocations() {
    const response = await apiClient.get('/ride-locations');
    return response.data;
  },

  // Create Ride Bill
  async createRideBill(rideBillData: any) {
    const response = await apiClient.post('/ride-bills', rideBillData);
    return response.data;
  },
};

export default apiClient;

