import { BottomNav } from "@/components/barra_navegacao"
import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/LanguageContext"
import { apiService } from "@/services/api"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { CameraType, CameraView, useCameraPermissions } from "expo-camera"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Vendas() {
  const { t, currentLanguage } = useLanguage();

  // Debug das traduções
  console.log('🌐 Idioma atual:', currentLanguage);
  console.log('🔧 Tradução debit:', t('debit'));
  console.log('🔧 Tradução credit:', t('credit'));
  const [facing, setFacing] = useState<CameraType>("back")
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null)
  const [produto, setProduto] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [lastScanTime, setLastScanTime] = useState<number>(0)
  const [permission, requestPermission] = useCameraPermissions()
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [paymentMethodKey, setPaymentMethodKey] = useState<string | null>(null) // Chave padronizada para API
  const [showPaymentTab, setShowPaymentTab] = useState(false)
  const [apiOnline, setApiOnline] = useState(true) // Status da API

  // Verifica autenticação e status da API quando entra na tela
  useEffect(() => {
    const checkAuth = async () => {
      setProduto(null)
      setCodigoBarras(null)
      setScanned(false)

      try {
        const token = await AsyncStorage.getItem('access_token')

        if (!token) {
          Alert.alert(
            t('accessDenied'),
            t('loginRequired'),
            [{ text: t('ok'), onPress: () => router.push("/") }]
          )
          return
        }

        // Verificar conectividade da API
        console.log('🔍 Verificando conectividade da API...')
        await apiService.utils.ping()
        setApiOnline(true)
        console.log('✅ API online')

      } catch (error) {
        console.error('❌ Erro na verificação da API:', error)
        setApiOnline(false)

        const token = await AsyncStorage.getItem('access_token')
        if (!token) {
          router.push("/")
        } else {
          // API offline mas token válido, continuar em modo offline
          console.log('⚠️ Continuando em modo offline')
        }
      }
    }

    checkAuth()

    // Verificar API a cada 30 segundos
    const interval = setInterval(async () => {
      try {
        await apiService.utils.ping()
        if (!apiOnline) {
          setApiOnline(true)
          console.log('✅ API voltou online')
        }
      } catch (error) {
        if (apiOnline) {
          setApiOnline(false)
          console.log('❌ API ficou offline')
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [apiOnline])

  // Busca produto pelo código de barras
  const buscarProduto = async (codigo: string) => {
    const agora = Date.now()

    if (agora - lastScanTime < 2000) return
    if (scanned || loading || codigo === lastScannedCode) return

    // Validação e sanitização do código
    if (!codigo || typeof codigo !== 'string') return

    // Filtrar URLs do Expo e códigos inválidos
    const codigoLimpo = codigo.trim()
    if (codigoLimpo.includes('://') || codigoLimpo.includes('exp://')) {
      console.log('🚫 Código inválido ignorado (URL):', codigoLimpo)
      return
    }

    if (codigoLimpo.length < 8 || codigoLimpo.length > 18) {
      console.log('🚫 Código com tamanho inválido:', codigoLimpo.length)
      return
    }

    // Verificar se é apenas números (códigos de barras válidos)
    if (!/^\d+$/.test(codigoLimpo)) {
      console.log('🚫 Código não numérico ignorado:', codigoLimpo)
      return
    }

    setLastScanTime(agora)
    setScanned(true)
    setLoading(true)
    setLastScannedCode(codigoLimpo)

    console.log('🔍 Buscando produto válido:', codigoLimpo)

    try {
      const data = await apiService.revistas.buscarPorCodigoBarras(codigoLimpo)

      if (!data) throw { response: { status: 404 } }

      const produtoEncontrado = data["data"] || data
      if (!produtoEncontrado) throw { response: { status: 404 } }

      setProduto(produtoEncontrado)
      setCodigoBarras(codigoLimpo)
      setShowPaymentTab(true)

      setTimeout(() => setScanned(false), 1000)
    } catch (error: any) {
      console.error('❌ Erro na busca de produto:', {
        codigo: codigoLimpo,
        error: error.message,
        status: error.response?.status,
        data: error.response?.data
      })

      setProduto(null)
      setCodigoBarras(null)

      let mensagem = t('productNotFound')
      let titulo = t('error')
      let showRetry = true

      // Tratamento específico por tipo de erro
      if (error.response?.status === 403) {
        mensagem = t('authError')
        titulo = 'Erro de Autenticação'
        showRetry = false
      } else if (error.response?.status === 404) {
        mensagem = t('productNotRegistered')
        titulo = 'Produto Não Encontrado'
        showRetry = false
      } else if (error.response?.status >= 500) {
        mensagem = 'Servidor temporariamente indisponível. Tente novamente em alguns segundos.'
        titulo = 'Problema no Servidor'
        setApiOnline(false)
      } else if (error.code === 'ECONNABORTED') {
        mensagem = 'Conexão muito lenta. Verifique sua internet e tente novamente.'
        titulo = 'Timeout'
      } else if (error.message?.includes('ConnectionTerminated')) {
        mensagem = 'Problema na conexão com o banco de dados. Tente novamente.'
        titulo = 'Erro de Conexão'
      } else if (!error.response) {
        mensagem = 'Sem conexão com a internet. Verifique sua rede.'
        titulo = 'Sem Conexão'
        setApiOnline(false)
      } else if (error.message) {
        mensagem = error.message
      }

      const buttons = []
      if (showRetry) {
        buttons.push({
          text: 'Tentar Novamente',
          onPress: () => {
            setTimeout(() => {
              setScanned(false)
              setLastScannedCode(null)
              buscarProduto(codigoLimpo)
            }, 1000)
          }
        })
      }
      buttons.push({
        text: 'Cancelar',
        style: 'cancel' as const,
        onPress: () => {
          setScanned(false)
          setLastScannedCode(null)
        }
      })

      Alert.alert(titulo, mensagem, buttons)

      setTimeout(() => {
        setScanned(false)
        setLastScannedCode(null)
      }, 5000)
    } finally {
      setLoading(false)
    }
  }

  // Reseta o scanner e limpa método de pagamento
  const resetScanner = () => {
    setProduto(null)
    setCodigoBarras(null)
    setScanned(false)
    setLoading(false)
    setLastScannedCode(null)
    setLastScanTime(0)
    setPaymentMethod(null)
    setPaymentMethodKey(null)
    setShowPaymentTab(false)
  }

  // Confirma venda
  const handleConfirmarVenda = async () => {
    if (!produto || !codigoBarras) {
      Alert.alert(t('error'), t('scanProductFirst'))
      return
    }

    if (!paymentMethod || !paymentMethodKey) {
      Alert.alert(t('error'), t('paymentWarning'))
      setShowPaymentTab(true)
      return
    }

    setLoading(true)
    try {
      const preco = produto.preco_capa || produto.preco_liquido || produto.preco || 0
      const precoNumerico = parseFloat(preco.toString()) || 0

      const agora = new Date()
      const dataFormatada = agora.toISOString().split('T')[0]

      // Validação mais rigorosa dos dados
      const vendaData = {
        metodo_pagamento: paymentMethodKey, // Usa a chave padronizada em vez da tradução
        codigo_barras: codigoBarras.toString().trim(),
        qtd_vendida: 1,
        desconto_aplicado: 0,
        valor_total: precoNumerico,
        data_venda: dataFormatada,
      }

      console.log('🔧 Dados da venda completos:', {
        metodo_pagamento_display: paymentMethod,
        metodo_pagamento_api: paymentMethodKey,
        idioma_atual: currentLanguage,
        produto_info: {
          nome: produto.nome,
          preco_capa: produto.preco_capa,
          preco_liquido: produto.preco_liquido,
          preco: produto.preco
        },
        dados_finais: vendaData,
        metodos_aceitos_api: ['Débito', 'Crédito', 'Pix', 'Dinheiro'],
        validacao_metodo: ['Débito', 'Crédito', 'Pix', 'Dinheiro'].includes(vendaData.metodo_pagamento)
      })

      // Validações robustas
      if (!vendaData.codigo_barras || vendaData.codigo_barras.length < 3) {
        throw new Error(`Código de barras inválido: "${vendaData.codigo_barras}"`)
      }
      if (!vendaData.valor_total || vendaData.valor_total <= 0 || isNaN(vendaData.valor_total)) {
        throw new Error(`Valor do produto inválido: ${vendaData.valor_total} (tipo: ${typeof vendaData.valor_total})`)
      }
      if (!vendaData.data_venda) {
        throw new Error('Data da venda não informada')
      }
      if (!vendaData.metodo_pagamento || vendaData.metodo_pagamento.trim() === '') {
        throw new Error(`Método de pagamento inválido: "${vendaData.metodo_pagamento}"`)
      }

      // Validação adicional dos métodos aceitos pela API
      const metodosAceitos = ['Débito', 'Crédito', 'Pix', 'Dinheiro']
      if (!metodosAceitos.includes(vendaData.metodo_pagamento)) {
        throw new Error(`Método de pagamento não reconhecido: "${vendaData.metodo_pagamento}". Métodos aceitos pela API: ${metodosAceitos.join(', ')}`)
      }

      // Tentar cadastrar venda com retry
      console.log('🚀 Iniciando cadastro de venda...')
      await apiService.revistas.buscarPorCodigoBarras(vendaData.codigo_barras)

      console.log('✅ Venda cadastrada com sucesso!')
      setApiOnline(true) // API funcionou, marcar como online

      Alert.alert(t('success'), t('saleConfirmed'), [
        {
          text: t('ok'),
          onPress: () => resetScanner()
        }
      ])
    } catch (error: any) {
      console.error('❌ Erro detalhado na venda:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers,
        config: error.config
      })

      let mensagemErro = t('saleError')
      let titulo = t('error')

      // Tratamento específico por tipo de erro
      if (error.response?.status === 500) {
        mensagemErro = `Erro interno do servidor (500). ${error.response?.data?.message || 'Tente novamente em alguns minutos.'}`
        titulo = 'Problema no Servidor'
      } else if (error.response?.status === 422) {
        const errorDetail = error.response?.data?.detail
        let specificError = 'Verifique o método de pagamento.'

        if (errorDetail && Array.isArray(errorDetail) && errorDetail[0]?.msg) {
          specificError = errorDetail[0].msg
        }

        mensagemErro = `Dados rejeitados (422): ${specificError}\n\nMétodo atual: ${paymentMethodKey}\nMétodos aceitos: Débito, Crédito, Pix, Dinheiro`
        titulo = 'Método de Pagamento Inválido'
      } else if (error.response?.status === 400) {
        mensagemErro = `Dados inválidos (400): ${error.response?.data?.message || 'Verifique as informações do produto.'}`
        titulo = 'Dados Inválidos'
      } else if (error.response?.status === 403) {
        mensagemErro = 'Sem permissão para registrar vendas. Faça login novamente.'
        titulo = 'Erro de Autenticação'
      } else if (error.response?.status === 404) {
        mensagemErro = 'Endpoint não encontrado. Verifique a configuração da API.'
        titulo = 'Erro de Configuração'
      } else if (error.code === 'ECONNABORTED') {
        mensagemErro = 'Conexão muito lenta. A venda pode não ter sido registrada. Verifique sua internet.'
        titulo = 'Timeout'
      } else if (error.message?.includes('ConnectionTerminated')) {
        mensagemErro = 'Problema na conexão com o banco de dados. A venda não foi registrada.'
        titulo = 'Erro de Conexão'
      } else if (!error.response) {
        mensagemErro = 'Sem conexão com a internet. A venda não foi registrada.'
        titulo = 'Sem Conexão'
      } else if (error.message) {
        mensagemErro = `Erro: ${error.message}`
      }

      // Log adicional para debug
      console.error('🔴 Erro final processado:', { titulo, mensagemErro })

      // Atualizar status da API baseado no erro
      if (error.response?.status >= 500 || !error.response) {
        setApiOnline(false)
      }

      const buttons = []

      // Só mostrar retry para erros temporários
      if (error.response?.status >= 500 ||
          error.code === 'ECONNABORTED' ||
          error.message?.includes('ConnectionTerminated') ||
          !error.response) {
        buttons.push({
          text: 'Tentar Novamente',
          onPress: () => {
            setTimeout(() => handleConfirmarVenda(), 1000)
          }
        })
      }

      buttons.push({
        text: 'Cancelar',
        style: 'cancel' as const
      })

      Alert.alert(titulo, mensagemErro, buttons)
    } finally {
      setLoading(false)
    }
  }

  // Mapeia métodos de pagamento traduzidos para valores aceitos pela API
  const getPaymentMethodKey = (translatedMethod: string): string => {
    // A API aceita EXATAMENTE: 'Débito', 'Crédito', 'Dinheiro' ou 'Pix'
    const methodMap: Record<string, string> = {
      // Português
      'Débito': 'Débito',
      'Crédito': 'Crédito',
      'Pix': 'Pix',
      'Dinheiro': 'Dinheiro',
      // Italiano
      'Debito': 'Débito',
      'Credito': 'Crédito',
      'Contanti': 'Dinheiro',
      // Inglês
      'Debit': 'Débito',
      'Credit': 'Crédito',
      'Cash': 'Dinheiro'
    }

    const key = methodMap[translatedMethod] || 'Dinheiro' // fallback para Dinheiro
    console.log('🔄 Mapeamento de método:', translatedMethod, '→', key)
    return key
  }

  // Função para selecionar método de pagamento
  const selectPaymentMethod = (method: string) => {
    const translatedMethod = method
    const methodKey = getPaymentMethodKey(translatedMethod)
    setPaymentMethod(translatedMethod)
    setPaymentMethodKey(methodKey)
    console.log('🔧 Método selecionado:', translatedMethod, '→ Chave API:', methodKey)
  }

  // Função chamada quando o usuário confirma o método de pagamento na aba/modal
  const confirmarMetodoPagamento = () => {
    if (!paymentMethod || !paymentMethodKey) {
      Alert.alert('Erro', 'Selecione uma forma de pagamento.')
      return
    }
    setShowPaymentTab(false)
  }

  if (!permission) return <View />
  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.container}>
          <Text style={{ textAlign: "center" }}>{t('cameraPermissionNeeded')}</Text>
          <Pressable onPress={requestPermission} style={styles.botao}>
            <Text style={styles.botaoTexto}>{t('allow')}</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // Render principal
  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t('salesPage')} />

      <ScrollView
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            <CameraView
              style={styles.fotoBox}
              facing={facing}
              barcodeScannerSettings={{
                barcodeTypes: ['code128', 'ean13', 'ean8', 'qr'],
              }}
              onBarcodeScanned={(result) => {
                if (result.data) buscarProduto(result.data)
              }}
            />

            {/* Status da API */}
            {!apiOnline && (
              <View style={[styles.statusInfo, { backgroundColor: '#fff3cd', borderLeftColor: '#ffc107' }]}>
                <Text style={[styles.statusTexto, { color: '#856404' }]}>
                  ⚠️ API temporariamente indisponível. Algumas funções podem não funcionar.
                </Text>
              </View>
            )}

            {/* Status */}
            {!produto && !loading && (
              <View style={styles.statusInfo}>
                <Text style={styles.statusTexto}>
                  {scanned ? t('waiting') : t('scanBarcode')}
                </Text>
              </View>
            )}

            {loading && (
              <View style={styles.statusInfo}>
                <ActivityIndicator size="large" color="#E67E22" />
                <Text style={styles.statusTexto}>{t('searchingProduct')}</Text>
              </View>
            )}

            {produto && (
              <>
                <View style={styles.produtoInfo}>
                  <Text style={styles.produtoNome}>{produto.nome}</Text>
                  <Text style={styles.produtoPreco}>
                    R$ {parseFloat(produto.preco_capa || 0).toFixed(2)}
                  </Text>
                  <Text style={styles.codigoBarras}>{t('code')}: {codigoBarras}</Text>

                  {/* Mostra método selecionado (se houver) */}
                  {paymentMethod ? (
                    <View style={styles.selectedPaymentRow}>
                      <Text style={styles.selectedPaymentLabel}>{t('paymentMethodLabel')}:</Text>
                      <View style={[
                        styles.paymentBadge,
                        paymentMethod === t('debit') && styles.paymentDebit,
                        paymentMethod === t('credit') && styles.paymentCredit,
                        (paymentMethod === t('pix') || paymentMethod === t('cash')) && styles.paymentBlack
                      ]}>
                        <Text style={styles.paymentBadgeText}>{paymentMethod}</Text>
                      </View>
                    </View>
                  ) : (
                    <Text style={{ marginTop: 8, color: "#666" }}>Nenhuma forma de pagamento selecionada</Text>
                  )}
                </View>

                {/* NOTE: o modal é controlado por showPaymentTab; mantive a mesma lógica de seleção */}
              </>
            )}

            {/* Botões */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity
                style={[styles.botaoAcao, styles.fixedRegistrarVendaBtn, (!produto || loading) && styles.botaoDisabled]}
                onPress={handleConfirmarVenda}
                disabled={loading || !produto}
              >
                <Text style={styles.fixedRegistrarVendaBtnText}>
                  {loading ? t('processing') : t('confirmSale')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.botaoAcao, styles.fixedRegistrarVendaBtn]}
                onPress={resetScanner}
                disabled={loading}
              >
                <Text style={styles.fixedRegistrarVendaBtnText}>{t('newScan')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNav />

      {/* Modal POPUP para seleção de Método de Pagamento */}
      <Modal
        visible={showPaymentTab}
        animationType="fade"
        transparent
        onRequestClose={() => {
          // fecha modal pelo botão de hardware (Android)
          setPaymentMethod(null)
          setPaymentMethodKey(null)
          setShowPaymentTab(false)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.paymentTabTitle}>{t('paymentMethodTitle')}</Text>

            <View style={styles.paymentOptionsRow}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === t('debit') ? styles.paymentOptionSelected : null,
                  { backgroundColor: '#E8F6EA' }
                ]}
                onPress={() => selectPaymentMethod(t('debit'))}
              >
                <Text style={[styles.paymentOptionText, { color: '#2E7D32', fontWeight: paymentMethod === t('debit') ? '700' : '600' }]}>{t('debit')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === t('credit') ? styles.paymentOptionSelected : null,
                  { backgroundColor: '#FDECEA' }
                ]}
                onPress={() => selectPaymentMethod(t('credit'))}
              >
                <Text style={[styles.paymentOptionText, { color: '#C62828', fontWeight: paymentMethod === t('credit') ? '700' : '600' }]}>{t('credit')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentOptionsRow}>
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === t('pix') ? styles.paymentOptionSelected : null]}
                onPress={() => selectPaymentMethod(t('pix'))}
              >
                <Text style={[styles.paymentOptionText, { color: '#000', fontWeight: paymentMethod === t('pix') ? '700' : '600' }]}>{t('pix')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === t('cash') ? styles.paymentOptionSelected : null]}
                onPress={() => selectPaymentMethod(t('cash'))}
              >
                <Text style={[styles.paymentOptionText, { color: '#000', fontWeight: paymentMethod === t('cash') ? '700' : '600' }]}>{t('cash')}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentTabActions}>
              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() => {
                  // cancelar seleção: limpa método e fecha modal
                  setPaymentMethod(null)
                  setPaymentMethodKey(null)
                  setShowPaymentTab(false)
                }}
              >
                <Text style={styles.botaoSecundarioTexto}>{t('cancel')}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.fixedRegistrarMetodoBtn,
                  { opacity: paymentMethod ? 1 : 0.6 }
                ]}
                onPress={confirmarMetodoPagamento}
                disabled={!paymentMethod}
              >
                <Text style={styles.fixedRegistrarVendaBtnText}>{t('confirm')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  botaoAcao: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 2,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },

  fixedRegistrarMetodoBtn: {
    backgroundColor: "#FF9800",
    borderWidth: 2,
    borderColor: "#FF9800",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 6,
  },
  fixedRegistrarVendaBtn: {
    backgroundColor: "#FF9800",
  },
  fixedRegistrarVendaBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    paddingBottom: 100, // Espaço para o BottomNav
  },
  container: {
    justifyContent: "center",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minHeight: 450,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  fotoBox: {
    width: "80%",
    height: 320,
    borderRadius: 12,
    overflow: "hidden", // importante para cortar a câmera no formato arredondado
    marginVertical: 24,
  },
  botao: {
    backgroundColor: "#E67E22",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  botaoDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.5,
  },
  produtoInfo: {
    alignItems: "center",
    marginVertical: 10,
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    width: "80%",
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  produtoPreco: {
    fontSize: 18,
    fontWeight: "700",
    color: "#E67E22",
    marginTop: 5,
  },
  codigoBarras: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  botoesContainer: {
    flexDirection: "row",
    gap: 16,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
  },
  botaoSecundario: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E67E22",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginRight: 6,
  },
  botaoSecundarioTexto: {
    color: "#E67E22",
    fontWeight: "600",
    fontSize: 14,
  },
  statusInfo: {
    alignItems: "center",
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    width: "80%",
    borderLeftWidth: 4,
    borderLeftColor: "#E67E22",
  },
  statusTexto: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 480,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    elevation: 8,
  },
  paymentTabTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    textAlign: "center",
  },
  paymentOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: '100%',
  },
  paymentOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    marginHorizontal: 4,
  },
  paymentOptionSelected: {
    borderWidth: 2,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  paymentOptionText: {
    fontSize: 15,
  },
  paymentTabActions: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: '100%',
  },
  selectedPaymentRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectedPaymentLabel: {
    fontSize: 13,
    color: "#444",
    fontWeight: "600",
  },
  paymentBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paymentBadgeText: {
    color: "#FFF",
    fontWeight: "700",
  },
  paymentDebit: {
    backgroundColor: "#2E7D32",
  },
  paymentCredit: {
    backgroundColor: "#C62828",
  },
  paymentBlack: {
    backgroundColor: "#000",
  }
})