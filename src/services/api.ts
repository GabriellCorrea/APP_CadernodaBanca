import axios from 'axios'
// import fetch from 'node-fetch'
import { supabase } from '../lib/supabase'

const API_BASE_URL = 'https://andreacontrollerapi.onrender.com'

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
  timeout: 10000, // 10 segundos de timeout
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
    
    if (err.code === 'ECONNABORTED') {
      console.error('⏰ Timeout da requisição')
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
    
    const res = await api.get(url)
    console.log('📦 Resposta da busca:', res.data)
    return res.data
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
    
    const res = await api.post('/vendas/cadastrar-venda-por-codigo', dados)
    console.log('✅ Resposta da API:', res.data)
    return res.data
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
