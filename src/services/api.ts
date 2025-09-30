import axios from 'axios';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  async (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    
    // Adiciona token de autenticação se existir
    try {
      const token = await AsyncStorage.getItem('authToken');
      if (token) {
        // Tenta diferentes formatos de autenticação
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['x-access-token'] = token; // Formato alternativo
        console.log(`Token adicionado: Bearer ${token.substring(0, 20)}...`);
      } else {
        console.log('Nenhum token encontrado para adicionar à requisição');
      }
    } catch (error) {
      console.error('Erro ao recuperar token do AsyncStorage:', error);
    }
    
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
  async (error) => {
    if (error.response?.status === 403) {
      const token = await AsyncStorage.getItem('authToken');
      console.error('Erro 403 - Não autenticado. Token atual:', token ? 'Existe' : 'Não existe');
      console.error('Headers enviados:', error.config?.headers);
      
      // Se não tem token, remove qualquer token inválido que possa existir
      if (!token) {
        await AsyncStorage.removeItem('authToken');
      }
    }
    console.error('API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });
    return Promise.reject(error);
  }
);

// Funções da API
export const apiService = {
  // Teste de conectividade
  testConnection: async () => {
    try {
      const response = await api.get('/health');
      return response.data;
    } catch (error) {
      console.log('Endpoint /health não existe, tentando /');
      const response = await api.get('/');
      return response.data;
    }
  },

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