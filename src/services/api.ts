import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// URL base da API
const API_BASE_URL = 'https://andreacontrollerapi.onrender.com';

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
      const token = await AsyncStorage.getItem('access_token'); // Token do Supabase
      if (token) {
        // Tenta diferentes formatos de autenticação
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['x-access-token'] = token; // Formato alternativo
        console.log(`Token do Supabase adicionado: Bearer ${token.substring(0, 20)}...`);
      } else {
        console.log('Nenhum token do Supabase encontrado para adicionar à requisição');
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
      // Testa diretamente o endpoint raiz que sabemos que existe
      const response = await api.get('/');
      console.log('✅ API conectada com sucesso');
      return response.data;
    } catch (error) {
      console.log('⚠️ Erro de conectividade da API, mas continuando...');
      // Não deixa falhar por causa de conectividade
      return { status: 'ok', message: 'API pode estar offline mas continuando' };
    }
  },

  // Autenticação - TEMPORÁRIO: Como a API não tem endpoint de login, simulamos um token
  login: async (email: string, password: string) => {
    console.log('🔍 Tentando login com:', email, password);

    // Simula validação básica
    if (email && password) {
      // Gera um token fake para testes
      const fakeToken = `fake_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('✅ Login simulado bem-sucedido, token gerado:', fakeToken);

      return {
        success: true,
        token: fakeToken,
        user: { email: email }
      };
    } else {
      throw new Error('Credenciais inválidas');
    }
  },

  // Buscar produto por código de barras - TEMPORÁRIO: Simula produtos para teste
  getProductByBarcode: async (barcode: string) => {
    console.log('🔍 Buscando produto com código:', barcode);

    // Simula produtos de exemplo (uma revista que você comprou)
    const produtosFake = {
      '9786525936314': { // O código da revista que você comprou
        id: 1,
        nome: 'AMANDA WALLER contra TODOS os SUPER-HERÓIS da TERRA!',
        title: 'AMANDA WALLER contra TODOS os SUPER-HERÓIS da TERRA!',
        preco: 16.50,
        estoque: 5,
        edicao: 'poder absoluto',
        codigo_barras: barcode
      },
      default: {
        id: 0,
        nome: 'Produto não encontrado',
        title: 'Produto não encontrado',
        preco: 0,
        estoque: 0,
        edicao: '',
        codigo_barras: barcode
      }
    };

    const response = await api.get(`/revistas/buscar/codigo-barras?q=${barcode}`);
    console.log(response.data)
    if (response.data) {
      console.log(response.data)
      return response.data
    }
    // Busca o produto ou usa o padrão
    // const produto = produtosFake[barcode as keyof typeof produtosFake] || produtosFake.default;

    // console.log('✅ Produto encontrado:', produto.nome);
    // return produto;
  },

  // Confirmar venda
  confirmarVenda: async (vendaData: any) => {
    console.log("Tentando confirmar a venda")
    const response = await api.post('/vendas/cadastrar-venda-por-codigo', vendaData);
    return response.data;
  },

  enviarArquivo: async (file: any) => {
    console.log("📤 Enviando arquivo:", {
      uri: file.uri,
      name: file.name,
      type: file.mimeType,
      size: file.size
    });

    const formData = new FormData();
    // @ts-ignore
    formData.append("file", {
      uri: file.uri,
      name: file.name || "chamada.pdf",
      type: file.mimeType || "application/pdf",
    });

    // Log do FormData (só funciona em algumas plataformas)
    console.log("📦 FormData preparado");

    try {
      const response = await api.post("/chamadas/cadastrar-chamada", formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
      });

      console.log("✅ Sucesso:", response.data);
      return response.data;
    } catch (error: any) {
      console.error("❌ Erro detalhado:", {
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        headers: error.config?.headers
      });
      throw error;
    }
  },

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