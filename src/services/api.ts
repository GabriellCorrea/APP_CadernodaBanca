import axios from 'axios';
import Constants from 'expo-constants';

// URL base da API
const API_BASE_URL = Constants.expoConfig?.extra?.API_URL || 'https://andreacontrollerapi.onrender.com';

// Instância do axios configurada
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// Funções da API
export const apiService = {
  // Autenticação
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },

  // Buscar produto por código de barras
  getProductByBarcode: async (barcode: string) => {
    const response = await api.get(`/revistas/buscar/codigo-barras?q=${barcode}`);
    return response.data;
  },

  // Confirmar venda
  confirmarVenda: async (vendaData: any) => {
    const response = await api.post('/vendas', vendaData);
    return response.data;
  },

  // Outros endpoints
  getMaisVendidos: async () => {
    const response = await api.get('/mais-vendidos');
    return response.data;
  },

  getEstoque: async () => {
    const response = await api.get('/estoque');
    return response.data;
  },

  getRelatorios: async () => {
    const response = await api.get('/relatorios');
    return response.data;
  },

  getMetaDoDia: async () => {
    const response = await api.get('/meta-do-dia');
    return response.data;
  },
};

export default api;