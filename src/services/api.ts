import axios from 'axios'
import { supabase } from '../lib/supabase'

const API_BASE_URL = 'https://andreacontrollerapi.onrender.com'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// Adiciona o token do Supabase nas requisições
api.interceptors.request.use(async (config) => {
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token

  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
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
    const res = await api.get(`/revistas/buscar/codigo-barras?q=${encodeURIComponent(codigo)}`)
    return toArray(res.data, 'data')
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
    const res = await api.post('/vendas/cadastrar-venda-por-codigo', dados)
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
