import axios from 'axios';
// import fetch from 'node-fetch'
import { supabase } from '../lib/supabase';

const API_BASE_URL = 'https://andreacontrollerapi-4fds.onrender.com'

// Configurações de retry e fallback
const MAX_RETRIES = 3
const RETRY_DELAY = 1000 // 1 segundo

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
  headers: { 'Content-Type': 'application/json' },
})

// Instância separada para uploads sem timeout
const apiUpload = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'multipart/form-data' },
  maxContentLength: Infinity,
  maxBodyLength: Infinity,
})

// Adiciona o token do Supabase nas requisições (instância principal)
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

// Interceptors para instância de upload
apiUpload.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  console.log('🔐 Token upload:', token ? `${token.substring(0, 20)}...` : 'Nenhum')

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiUpload.interceptors.response.use(
  (res) => {
    console.log('✅ Upload resposta:', res.status, res.config?.url)
    return res
  },
  (err) => {
    console.error('❌ Erro upload:')
    console.error('  - Status:', err.response?.status)
    console.error('  - URL:', err.config?.url?.substring(0, 50))
    console.error('  - Código:', err.code)

    if (err.code === 'ECONNABORTED') {
      console.error('⏰ Timeout no upload')
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
  /**
   * Funções relacionadas às metas.
   */
  metas: {
    /**
     * Busca a meta diária de vendas.
     * (Movida da função exportada 'buscarMetaDiaria')
     */
    async getDiaria() {
      try {
        // Retorna uma meta padrão por enquanto, ou você pode criar um endpoint na API
        return 600;
      } catch (error) {
        console.error('Erro ao buscar meta:', error);
        return 600; // valor padrão caso não encontre meta para o dia
      }
    }
  },

  /**
   * Funções relacionadas a Revistas e Produtos.
   */
  revistas: {
    /**
     * Busca todas as revistas.
     * (Era 'getRevistas')
     */
    async getTudo() {
      const res = await api.get('/revistas/tudo')
      const revistas = toArray(res.data, 'data')

      return revistas.map((rev: any) => ({
        ...rev,
        imagem: rev.imagem?.source?.uri ? { uri: rev.imagem.source.uri } : null,
      }))
    },

    /**
     * Busca uma revista pelo nome.
     * (Era 'buscarRevistaPorNome')
     */
    async buscarPorNome(nome: string) {
      const res = await api.get(`/revistas/buscar/nome?q=${encodeURIComponent(nome)}`)
      return toArray(res.data, 'data')
    },

    /**
     * Busca uma revista pelo código de barras.
     * (Era 'buscarRevistaPorCodigoBarras')
     */
    async buscarPorCodigoBarras(codigo: string) {
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

    /**
     * Busca uma revista pela edição.
     * (Era 'buscarRevistaPorEdicao')
     */
    async buscarPorEdicao(edicao: string) {
      const res = await api.get(`/revistas/buscar/edicao?q=${encodeURIComponent(edicao)}`)
      return toArray(res.data, 'data')
    },

    /**
     * Envia a foto de uma revista para cadastro.
     * (Era 'cadastrarFotoRevista')
     */
    async cadastrarFoto(file: any) {
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
  },

  /**
   * Funções relacionadas a Vendas e Relatórios.
   */
  vendas: {
    /**
     * Busca todas as vendas.
     * (Era 'getVendas')
     */
    async getTudo() {
      const res = await api.get('/vendas/tudo')
      return toArray(res.data, 'data')
    },

    /**
     * Busca as vendas recentes.
     * (Era 'getVendasRecentes')
     */
    async getRecentes() {
      const res = await api.get('/vendas/recentes')
      return toArray(res.data, 'data')
    },

    /**
     * Busca as vendas de hoje, com retry e mapeamento.
     * (Lógica movida de 'buscarVendasDoDia' e 'getVendasHoje')
     */
    async getHoje() {
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
    },

    /**
     * Cadastra uma nova venda usando código de barras.
     * (Era 'cadastrarVendaPorCodigo')
     */
    async cadastrarPorCodigo(dados: any) {
      console.log('🚀 Enviando dados para API:', dados)
      console.log('🌐 URL:', `${API_BASE_URL}/vendas/cadastrar-venda-por-codigo`)

      return await retryWithBackoff(async () => {
        const res = await api.post('/vendas/cadastrar-venda-por-codigo', dados)
        console.log('✅ Resposta da API:', res.data)
        return res.data
      })
    },

    /**
     * Cadastra uma nova venda usando ID do produto.
     * (Era 'cadastrarVendaPorId')
     */
    async cadastrarPorId(dados: any) {
      const res = await api.post('/vendas/cadastrar-venda-por-id', dados)
      return res.data
    },

    /**
     * Busca o relatório de vendas da semana.
     * (Era 'getRelatorioSemana')
     */
    async getRelatorioSemana() {
      const res = await api.get('/vendas/relatorio-semana')
      return res.data
    },
  },

  /**
   * Funções relacionadas a Chamadas (PDFs).
   */
  chamadas: {
    /**
     * Envia o PDF de uma chamada para cadastro.
     * (Era 'cadastrarChamada')
     */
    async cadastrar(file: any) {
      console.log('📤 Iniciando upload...')
      console.log('📄', file.name, `(${(file.size / 1024 / 1024).toFixed(2)} MB)`)
      console.log('🚀 Enviando para servidor...')
      
      const formData = new FormData()
      // @ts-ignore
      formData.append('file', {
        uri: file.uri,
        name: file.name || 'chamada.pdf',
        type: file.mimeType || 'application/pdf',
      })

      const startTime = Date.now();
      
      // Usar a instância apiUpload sem timeout
      const res = await apiUpload.post('/chamadas/cadastrar-chamada', formData)
      
      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      console.log(`✅ Upload concluído em ${duration.toFixed(1)}s`)

      return res.data
    },

    /**
     * Lista as chamadas de um usuário específico.
     * (Era 'listarChamadasUsuario')
     */
    async listarPorUsuario(usuarioId: string) {
      try {
        return await retryWithBackoff(async () => {
          const res = await api.get(`/chamadas/listar-chamadas-usuario?usuarioId=${usuarioId}`)
          return toArray(res.data, 'data')
        })
      } catch (error: any) {
        console.error('❌ Erro ao listar chamadas do usuário:', error?.response?.status, error?.response?.data || error.message)
        // Se for erro de servidor, tentar alguns fallbacks simples (diferença no nome do query param)
        const status = error?.response?.status
        if (status >= 500) {
          try {
            console.log('🔁 Tentando fallback com parametro usuario_id...')
            const res2 = await api.get(`/chamadas/listar-chamadas-usuario?usuario_id=${usuarioId}`)
            return toArray(res2.data, 'data')
          } catch (err2) {
            console.error('❌ Fallback usuario_id falhou:', (err2 as any)?.response?.status)
          }

          try {
            console.log('🔁 Tentando fallback com parametro userId...')
            const res3 = await api.get(`/chamadas/listar-chamadas-usuario?userId=${usuarioId}`)
            return toArray(res3.data, 'data')
          } catch (err3) {
            console.error('❌ Fallback userId falhou:', (err3 as any)?.response?.status)
          }
        }

        // Re-throw para que o chamador (UI) possa tratar e exibir mensagem apropriada
        throw error
      }
    },
  },

  /**
   * Funções utilitárias.
   */
  utils: {
    /**
     * Verifica se a API está online.
     */
    async ping() {
      const res = await api.get('/ping')
      return res.data
    },
  }
}

export default api