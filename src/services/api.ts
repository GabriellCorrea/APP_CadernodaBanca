import axios from 'axios';
// import fetch from 'node-fetch'
import { supabase } from '../lib/supabase';

const API_BASE_URL = 'https://andreacontrollerapi.onrender.com'

// Configurações de retry e fallback
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 segundo
const FALLBACK_TIMEOUT = 5000 // 5 segundos

// Função auxiliar para retry com backoff exponencial
const retryWithBackoff = async (fn: () => Promise<any>, maxRetries = MAX_RETRIES): Promise<any> => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn()
    } catch (error: any) {
      if (attempt === maxRetries) {
        throw error
      }
      
      // Só faz retry em erros de rede/servidor (5xx, timeout, etc)
      if (
        error.code === 'ECONNABORTED' ||
        error.code === 'NETWORK_ERROR' ||
        (error.response?.status >= 500 && error.response?.status < 600) ||
        error.message?.includes('ConnectionTerminated')
      ) {
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1) // backoff exponencial
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} falhou, tentando novamente em ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        // Erro que não deve fazer retry (4xx, etc)
        throw error
      }
    }
  }
}

// Funções para meta diária
export async function buscarMetaDiaria() {
  try {
    // Retorna uma meta padrão por enquanto, ou você pode criar um endpoint na API
    return 600;
  } catch (error) {
    console.error('Erro ao buscar meta:', error);
    return 600; // valor padrão caso não encontre meta para o dia
  }
}

// Função para buscar vendas do dia
export async function buscarVendasDoDia() {
  try {
    return await retryWithBackoff(async () => {
      const res = await api.get('/vendas/hoje');
      const vendas = toArray(res.data, 'data');
      
      // Mapeia as vendas para o formato esperado
      return vendas.map((venda: any) => ({
        id: venda.id_venda || venda.id,
        valor: parseFloat(venda.valor_total || venda.valor || 0)
      }));
    });
  } catch (error) {
    console.error('Erro ao buscar vendas após várias tentativas:', error);
    return [];
  }
}

// export async function cadastrarVendaPorCodigo(dados: any) {
//   const res = await fetch('https://andreacontrollerapi.onrender.com/vendas/cadastrar-venda-por-codigo', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: dados,
//   })

//   if (!res.ok) throw new Error(`Erro HTTP ${res.status}`)
//   return res.json()
// }

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: FALLBACK_TIMEOUT,
  headers: { 'Content-Type': 'application/json' },
})

// Adiciona o token do Supabase nas requisições
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  console.log('🔐 Token de autenticação:', token ? `${token.substring(0, 20)}...` : 'Nenhum')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (res) => {
    console.log('✅ Resposta HTTP:', res.status, res.config?.url)
    return res
  },
  (err) => {
    console.error('❌ Erro HTTP detalhado:')
    console.error('  - Status:', err.response?.status)
    console.error('  - URL:', err.config?.url)
    console.error('  - Dados:', err.response?.data)
    console.error('  - Mensagem:', err.message)
    console.error('  - Código:', err.code)
    
    // Mensagens de erro mais amigáveis
    if (err.code === 'ECONNABORTED') {
      console.error('⏰ Timeout da requisição - servidor demorou para responder')
    } else if (err.response?.status >= 500) {
      console.error('🔧 Erro interno do servidor - problema na API')
    } else if (err.message?.includes('ConnectionTerminated')) {
      console.error('🔌 Conexão com banco de dados terminada inesperadamente')
    } else if (!err.response) {
      console.error('🌐 Erro de rede - verifique sua conexão')
    }
    
    throw err
  }
)

const toArray = (data: any, key?: string) => {
  if (!data) return []
  const val = key ? data[key] : data
  return Array.isArray(val) ? val : []
}

export const apiService = {
  async getRevistas() {
    const res = await api.get('/revistas/tudo')
    const revistas = toArray(res.data, 'data')

    return revistas.map((rev: any) => ({
      ...rev,
      imagem: rev.imagem?.source?.uri ? { uri: rev.imagem.source.uri } : null,
    }))
  },

  async buscarRevistaPorNome(nome: string) {
    const res = await api.get(`/revistas/buscar/nome?q=${encodeURIComponent(nome)}`)
    return toArray(res.data, 'data')
  },

  async buscarRevistaPorCodigoBarras(codigo: string) {
    if (!codigo || codigo.length < 8) {
      throw new Error('Código de barras inválido ou muito curto')
    }
    
    console.log('🔍 Buscando produto com código:', codigo)
    const url = `/revistas/buscar/codigo-barras?q=${encodeURIComponent(codigo.trim())}`
    console.log('🌐 URL da busca:', `${API_BASE_URL}${url}`)
    
    return await retryWithBackoff(async () => {
      const res = await api.get(url)
      console.log('📦 Resposta da busca:', res.data)
      return res.data
    })
  },

  async buscarRevistaPorEdicao(edicao: string) {
    const res = await api.get(`/revistas/buscar/edicao?q=${encodeURIComponent(edicao)}`)
    return toArray(res.data, 'data')
  },

  async cadastrarFotoRevista(file: any) {
    const formData = new FormData()
    // @ts-ignore
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'revista.jpg',
      type: file.mimeType || 'image/jpeg',
    })

    const res = await api.post('/revistas/cadastrar-foto', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return res.data
  },

  async getVendas() {
    const res = await api.get('/vendas/tudo')
    return toArray(res.data, 'data')
  },

  async getVendasRecentes() {
    const res = await api.get('/vendas/recentes')
    return toArray(res.data, 'data')
  },

  async getVendasHoje() {
    const res = await api.get('/vendas/hoje')
    return toArray(res.data, 'data')
  },

  async cadastrarVendaPorCodigo(dados: any) {
    console.log('🚀 Enviando dados para API:', dados)
    console.log('🌐 URL:', `${API_BASE_URL}/vendas/cadastrar-venda-por-codigo`)
    
    return await retryWithBackoff(async () => {
      const res = await api.post('/vendas/cadastrar-venda-por-codigo', dados)
      console.log('✅ Resposta da API:', res.data)
      return res.data
    })
  },
  
  async cadastrarVendaPorId(dados: any) {
    const res = await api.post('/vendas/cadastrar-venda-por-id', dados)
    return res.data
  },

  async getRelatorioSemana() {
    const res = await api.get('/vendas/relatorio-semana')
    return res.data
  },

  async cadastrarChamada(file: any) {
    const formData = new FormData()
    // @ts-ignore
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'chamada.pdf',
      type: file.mimeType || 'application/pdf',
    })

    const res = await api.post('/chamadas/cadastrar-chamada', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })

    return res.data
  },

  async listarChamadasUsuario(usuarioId: string) {
    const res = await api.get(`/chamadas/listar-chamadas-usuario?usuarioId=${usuarioId}`)
    return toArray(res.data, 'data')
  },

  async ping() {
    const res = await api.get('/ping')
    return res.data
  },
}

export default api
