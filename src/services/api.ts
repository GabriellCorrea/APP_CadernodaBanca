import axios from 'axios';
import Constants from 'expo-constants';
import { supabase } from '../lib/supabase';

// IP da sua máquina
const API_BASE_URL = 'https://andreacontrollerapi-4fds.onrender.com';
// const API_BASE_URL = 'http://192.168.15.11:8000';

// Configurações de retry e fallback
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 segundo
const FALLBACK_TIMEOUT = 5000 // 5 segundos
// NOVO: Timeout longo para uploads de PDF (5 minutos)
const UPLOAD_TIMEOUT = 300000

// --- FUNÇÕES AUXILIARES ---
// ... (retryWithBackoff, api, interceptors, toArray - sem alterações) ...
// (Omitindo por brevidade, eles permanecem iguais)

/**
 * Tenta executar uma função com retry e backoff exponencial.
 */
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
        const delay = RETRY_DELAY * Math.pow(2, attempt - 1)
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} falhou, tentando novamente em ${delay}ms...`)
        await new Promise(resolve => setTimeout(resolve, delay))
      } else {
        // Erro que não deve fazer retry (4xx, etc)
        throw error
      }
    }
  }
}

/**
 * Instância principal do Axios.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: FALLBACK_TIMEOUT, // Timeout padrão de 5s
  headers: { 'Content-Type': 'application/json' },
})

/**
 * Interceptor para injetar o token de autenticação em todas as requisições.
 */
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  console.log('🔐 Token de autenticação:', token ? `${token.substring(0, 20)}...` : 'Nenhum')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

/**
 * Interceptor para log de respostas e erros.
 */
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

/**
 * Helper para garantir que o retorno seja sempre um array.
 */
const toArray = (data: any, key?: string) => {
  if (!data) return []
  const val = key ? data[key] : data
  return Array.isArray(val) ? val : []
}

/**
 * Helper para criar um FormData a partir de um arquivo.
 */
const createFormData = (file: any, fieldName: string = 'file', defaultName: string) => {
  const formData = new FormData()
  // @ts-ignore
  formData.append(fieldName, {
    uri: file.uri,
    name: file.name || defaultName,
    type: file.mimeType || 'application/octet-stream',
  })
  return formData
}

// --- FIM DAS FUNÇÕES AUXILIARES ---


/**
 * Objeto principal de serviço da API, estruturado conforme sua solicitação.
 */
export const apiService = {
  /**
   * Endpoints de Relatórios
   */
  relatorios: {
    // ... (sem alterações)
    async home() {
      const res = await api.get('/relatorios/vendas/hoje')
      return res.data?.data // Retorna o objeto {faturamento_do_dia, ultimas_vendas}
    },
    async dashboardGeral() {
      const res = await api.get('/relatorios/vendas/dashboard-geral')
      return res.data?.data // Retorna o objeto {hoje, semana, ticket_medio, mais_vendidos}
    },
    async kpiFaturamentoHoje() {
      try {
        const res = await api.get('/relatorios/kpi/faturamento-hoje');
        return res.data?.data || { faturamento_hoje: 0 };
      } catch (error: any) {
        console.error('❌ Erro ao buscar faturamento hoje:', error.message);
        return { faturamento_hoje: 0 };
      }
    },

/**
 * CARD 2: Unidades Vendidas Hoje
 */
async kpiUnidadesHoje() {
  try {
    const res = await api.get('/relatorios/kpi/unidades-hoje');
    return res.data?.data || { unidades_vendidas_hoje: 0 };
  } catch (error: any) {
    console.error('❌ Erro ao buscar unidades hoje:', error.message);
    return { unidades_vendidas_hoje: 0 };
  }
},
/**
 * CARD 3: Devoluções Pendentes
 */
async kpiDevolucoesPendentes() {
  try {
    const res = await api.get('/relatorios/kpi/devolucoes-pendentes');
    return res.data?.data || { devolucoes_pendentes: 0 };
  } catch (error: any) {
    console.error('❌ Erro ao buscar devoluções pendentes:', error.message);
    return { devolucoes_pendentes: 0 };
  }
},

/**
 * CARD 4: Próxima Data Limite de Devolução
 */
async kpiProximaDevolucao() {
  try {
    const res = await api.get('/relatorios/kpi/proxima-devolucao');
    return res.data?.data || { proxima_data_limite: null };
  } catch (error: any) {
    console.error('❌ Erro ao buscar próxima devolução:', error.message);
    return { proxima_data_limite: null };
  }
},

/**
 * CARD 5: Faturamento dos Últimos 30 Dias
 */
async kpiFaturamento30d() {
  try {
    const res = await api.get('/relatorios/kpi/faturamento-30d');
    return res.data?.data || { faturamento_ultimos_30_dias: 0 };
  } catch (error: any) {
    console.error('❌ Erro ao buscar faturamento 30d:', error.message);
    return { faturamento_ultimos_30_dias: 0 };
  }
},

/**
 * CARD 6: Ticket Médio dos Últimos 30 Dias
 */
async kpiTicketMedio30d() {
  try {
    const res = await api.get('/relatorios/kpi/ticket-medio-30d');
    return res.data?.data || { ticket_medio_ultimos_30_dias: 0 };
  } catch (error: any) {
    console.error('❌ Erro ao buscar ticket médio 30d:', error.message);
    return { ticket_medio_ultimos_30_dias: 0 };
  }
},

/**
 * Endpoints de Relatórios - Gráficos
 */

/**
 * GRÁFICO 1: Top 5 Revistas Vendidas Hoje
 * Retorna array: [{ nome: string, total_vendido: number }]
 */
async graficoTop5RevistasHoje() {
  try {
    const res = await api.get('/relatorios/grafico/top5-revistas-hoje');
    const data = res.data?.data;
    
    // Validar se é um array válido
    if (!Array.isArray(data)) {
      console.warn('⚠️ Top 5 revistas não retornou array, usando array vazio');
      return [];
    }
    
    // Validar estrutura de cada item
    return data.filter(item => 
      item && 
      typeof item.nome === 'string' && 
      typeof item.total_vendido === 'number'
    );
  } catch (error: any) {
    console.error('❌ Erro ao buscar top 5 revistas:', error.message);
    return [];
  }
},



async graficoTop5RevistasSemanal() {
  try {
    const res = await api.get('/relatorios/grafico/top5-revistas-7d');
    const data = res.data?.data;
    
    // Validar se é um array válido
    if (!Array.isArray(data)) {
      console.warn('⚠️ Top 5 revistas não retornou array, usando array vazio');
      return [];
    }
    
    // Validar estrutura de cada item
    return data.filter(item => 
      item && 
      typeof item.nome === 'string' && 
      typeof item.total_vendido === 'number'
    );
  } catch (error: any) {
    console.error('❌ Erro ao buscar top 5 revistas:', error.message);
    return [];
  }
},

/**
 * GRÁFICO 2: Vendas por Método de Pagamento (Últimos 30 dias)
 * Retorna array: [{ metodo_pagamento: string, faturamento: number, quantidade_vendas: number }]
 */
async graficoVendasPorPagamento30d() {
  try {
    const res = await api.get('/relatorios/grafico/vendas-por-pagamento-30d');
    const data = res.data?.data;
    
    // Validar se é um array válido
    if (!Array.isArray(data)) {
      console.warn('⚠️ Vendas por pagamento não retornou array, usando array vazio');
      return [];
    }
    
    // Validar estrutura de cada item
    return data.filter(item => 
      item && 
      typeof item.metodo_pagamento === 'string' && 
      typeof item.faturamento === 'number' &&
      typeof item.quantidade_vendas === 'number'
    );
  } catch (error: any) {
    console.error('❌ Erro ao buscar vendas por pagamento:', error.message);
    return [];
  }
  },
  },

  /**
   * Endpoints de Revistas (Estoque)
   */
  revistas: {
    // ... (sem alterações)
    async estoque() {
      const res = await api.get('/revistas/tudo')
      const revistas = toArray(res.data, 'data')
      return revistas.map((rev: any) => ({
        ...rev,
        imagem: rev.imagem?.source?.uri ? { uri: rev.imagem.source.uri } : null,
      }))
    },
    async buscarPorCodigoBarras(codigo: string) {
      if (!codigo || codigo.length < 8) {
        throw new Error('Código de barras inválido ou muito curto')
      }
      const url = `/revistas/buscar/codigo-barras?q=${encodeURIComponent(codigo.trim())}`
      console.log('🌐 URL da busca:', `${API_BASE_URL}${url}`)

      return await retryWithBackoff(async () => {
        const res = await api.get(url)
        console.log('📦 Resposta da busca:', res.data)
        return res.data // Retorna a resposta completa (ex: { data: {...} })
      })
    },
    async buscarPorNome(nome: string) {
      const res = await api.get(`/revistas/buscar/nome?q=${encodeURIComponent(nome)}`)
      return toArray(res.data, 'data') // Retorna um array de produtos
    },
    async cadastrarFoto(id_revista: number, file: any) {

      const formData = createFormData(file, 'imagem', 'revista.jpg')
      const res = await api.post(
        `/revistas/cadastrar-foto?codigo=${id_revista}`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          // ATUALIZADO: Timeout longo para upload de imagem
          timeout: UPLOAD_TIMEOUT
        }
      )
      return res.data
    },
    async cadastrarCodigo(dados: { nome: string; numero_edicao: number; codigo_barras: string }) {
      const res = await api.post('/revistas/cadastrar-codigo', dados)
      return res.data
    },
  },

  /**
   * Endpoints de Vendas
   */
  vendas: {
    // ... (sem alterações)
    async cadastrarPorId(dados: any) {
      console.log('🚀 Enviando dados para API:', dados)
      console.log('🌐 URL:', `${API_BASE_URL}/vendas/cadastrar-venda-por-id`)

        const res = await api.post('/vendas/cadastrar-venda-por-id', dados)
        console.log('✅ Resposta da API:', res.data)
        return res.data
    }
  },

  /**
   * Endpoints de Entregas (Entrada de NF)
   */
  entregas: {
    async cadastrar(file: any) {
      const formData = createFormData(file, 'file', 'entrega.pdf')
      const res = await api.post('/entregas/cadastrar-entrega', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // ATUALIZADO: Timeout específico de 5 minutos para este upload
        timeout: UPLOAD_TIMEOUT
      })
      return res.data
    },
    async listarPorUsuario() {
      try {
          return await retryWithBackoff(async () => {
            const res = await api.get('/entregas/listar-entradas-usuario');
            return toArray(res.data);
          });
        } catch (error) {
          console.error('Erro ao buscar histórico de entregas:', error);
          return [];
        }
      },
    async consultar(id_entrega: number | string) {
      const res = await api.get(`/entregas/${id_entrega}`);
      return res.data; 
  }
  },

  /**
   * Endpoints de Devoluções (Chamadas de Devolução)
   */
  devolucoes: {
    async cadastrar(file: any) {
      const formData = createFormData(file, 'file', 'devolucao.pdf')
      const res = await api.post('/devolucoes/cadastrar-devolucao', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        // ATUALIZADO: Timeout específico de 5 minutos para este upload
        timeout: UPLOAD_TIMEOUT
      })
      return res.data
    },
    async listarPorUsuario() {
      const res = await api.get(`/devolucoes/listar-devolucoes-usuario`)
      return toArray(res.data) // 'toArray' lida com a resposta
    },
    async consultar(id_devolucao: number) {
        const res = await api.get(`/devolucoes/${id_devolucao}`)
        return res.data
    },
    async confirmar(id_devolucao: number) {
        const res = await api.post(`/devolucoes/${id_devolucao}/confirmar`, {})
        return res.data
    }
  },

  /**
   * Endpoints Utilitários
   */
  utils: {
    // ... (sem alterações)
    async ping() {
      const res = await api.get('/ping')
      return res.data
    },
  },
}