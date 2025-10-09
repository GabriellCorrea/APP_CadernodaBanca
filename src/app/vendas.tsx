import { BottomNav } from "@/components/barra_navegacao"
import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/LanguageContext"
import { apiService } from "@/services/api"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { CameraType, CameraView, useCameraPermissions } from "expo-camera"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View, TouchableOpacity } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Vendas() {
  const { t } = useLanguage();
  const [facing, setFacing] = useState<CameraType>("back")
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null)
  const [produto, setProduto] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [lastScanTime, setLastScanTime] = useState<number>(0)
  const [permission, requestPermission] = useCameraPermissions()

  // Verifica autenticação quando entra na tela
  useEffect(() => {
    const checkAuth = async () => {
      setProduto(null)
      setCodigoBarras(null)
      setScanned(false)

      try {
        const token = await AsyncStorage.getItem('access_token')
        console.log('🔍 Token do Supabase:', token ? `${token.substring(0, 20)}...` : 'Nenhum')

        if (!token) {
          Alert.alert(
            t('accessDenied'),
            t('loginRequired'),
            [{ text: t('ok'), onPress: () => router.push("/") }]
          )
          return
        }

        console.log('🔗 Testando API...')
        await apiService.ping()
        console.log('✅ API acessível')

      } catch (error) {
        console.error('Erro na verificação de auth/API:', error)
        const token = await AsyncStorage.getItem('access_token')
        if (!token) router.push("/")
      }
    }

    checkAuth()
  }, [])

  // Busca produto pelo código de barras
  const buscarProduto = async (codigo: string) => {
    const agora = Date.now()
    
    // Evita scans muito frequentes (debounce de 2 segundos)
    if (agora - lastScanTime < 2000) {
      console.log('🚫 Scan muito rápido, ignorando')
      return
    }
    
    if (scanned || loading || codigo === lastScannedCode) return

    // Evita códigos muito curtos ou inválidos
    if (!codigo || codigo.length < 8) {
      console.log('🚫 Código muito curto, ignorando:', codigo)
      return
    }

    setLastScanTime(agora)
    setScanned(true)
    setLoading(true)
    setLastScannedCode(codigo)

    try {
      console.log("📦 Código escaneado:", codigo)
      
      // Validação básica do código antes de enviar
      if (!codigo || codigo.length < 3) {
        throw new Error('Código de barras muito curto ou inválido')
      }
      
      const data = await apiService.buscarRevistaPorCodigoBarras(codigo)

      if (!data) {
        throw { response: { status: 404 } }
      }
      console.log('🔍 Resposta completa da API:', data)

      // Verifica se tem dados válidos na resposta
      const produtoEncontrado = data["data"] || data
      if (!produtoEncontrado) {
        throw { response: { status: 404 } }
      }
      
      setProduto(produtoEncontrado)
      setCodigoBarras(codigo)
      console.log("✅ Produto encontrado:", produtoEncontrado)
      console.log("💰 Preço do produto:", produtoEncontrado?.preco_capa)

      // Libera novo scan após um tempo
      setTimeout(() => setScanned(false), 1000)
    } catch (error: any) {
      console.error('❌ ERRO na busca do produto:', error.message || error)
      if (error.response) {
        console.error('📄 Status do erro:', error.response.status)
        console.error('📄 Dados do erro:', error.response.data)
        console.error('📄 URL que falhou:', error.config?.url)
      }
      
      setProduto(null)
      setCodigoBarras(null)

      let mensagem = t('productNotFound')
      if (error.response?.status === 403) {
        mensagem = t('authError')
      } else if (error.response?.status === 404) {
        mensagem = t('productNotRegistered')
      } else if (error.response?.status >= 500) {
        mensagem = `${t('serverError')} (Erro na busca do produto)`
      } else if (error.message) {
        mensagem = error.message
      }

      Alert.alert(t('error'), mensagem)

      setTimeout(() => {
        setScanned(false)
        setLastScannedCode(null)
      }, 2000)
    } finally {
      setLoading(false)
    }
  }

  // Reseta o scanner
  const resetScanner = () => {
    setProduto(null)
    setCodigoBarras(null)
    setScanned(false)
    setLoading(false)
    setLastScannedCode(null)
    setLastScanTime(0)
  }

  // Confirma venda
  const handleConfirmarVenda = async () => {
    if (!produto || !codigoBarras) {
      Alert.alert(t('error'), t('scanProductFirst'))
      return
    }

    setLoading(true)
    try {
      // Tenta diferentes campos de preço que podem existir no produto
      const preco = produto.preco_capa || produto.preco_liquido || produto.preco || 0
      const precoNumerico = parseFloat(preco.toString()) || 0
      
      // Gera data no formato mais simples
      const agora = new Date()
      const dataFormatada = agora.toISOString().split('T')[0] // YYYY-MM-DD
      
      const vendaData = {
        metodo_pagamento: 'Débito',
        codigo_barras: codigoBarras.toString().trim(),
        qtd_vendida: 1,
        desconto_aplicado: 0,
        valor_total: precoNumerico,
        data_venda: dataFormatada,
      }

      console.log('📦 Dados da venda a serem enviados:', vendaData)
      console.log('📦 Produto encontrado:', produto)

      // Validação rigorosa dos dados antes de enviar
      if (!vendaData.codigo_barras || vendaData.codigo_barras.length < 3) {
        throw new Error('Código de barras inválido')
      }
      if (!vendaData.valor_total || vendaData.valor_total <= 0 || isNaN(vendaData.valor_total)) {
        throw new Error(`Valor do produto inválido: ${vendaData.valor_total}`)
      }
      if (!vendaData.data_venda) {
        throw new Error('Data da venda não informada')
      }

      // Chama o endpoint para cadastrar a venda
      await apiService.cadastrarVendaPorCodigo(vendaData)

      Alert.alert(t('success'), t('saleConfirmed'))
      resetScanner()
    } catch (error: any) {
      console.error('❌ Erro ao confirmar venda:', error)
      
      let mensagemErro = t('saleError')
      if (error.response) {
        console.error('📄 Resposta do servidor:', error.response.data)
        console.error('📄 Status:', error.response.status)
        
        if (error.response.status === 500) {
          mensagemErro = 'Erro interno do servidor. Tente novamente.'
        } else if (error.response.status === 400) {
          mensagemErro = 'Dados inválidos. Verifique as informações.'
        }
      }
      
      Alert.alert(t('error'), mensagemErro)
    } finally {
      setLoading(false)
    }
  }


  // Permissões da câmera
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
              <View style={styles.produtoInfo}>
                <Text style={styles.produtoNome}>{produto.nome}</Text>
                <Text style={styles.produtoPreco}>
                  R$ {parseFloat(produto.preco_capa || 0).toFixed(2)}
                </Text>
                <Text style={styles.codigoBarras}>{t('code')}: {codigoBarras}</Text>
              </View>
            )}

            {/* Botões */}
            <View style={styles.botoesContainer}>
              <TouchableOpacity
                style={[styles.fixedRegistrarVendaBtn, styles.botoesBox, (!produto || loading) && styles.botaoDisabled]}
                onPress={handleConfirmarVenda}
                disabled={loading || !produto}
              >
                <Text style={styles.fixedRegistrarVendaBtnText}>
                  {loading ? t('processing') : t('confirmSale')}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.fixedRegistrarVendaBtn, styles.botoesBox]}
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
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  botoesBox: {
    flex: 1,
    marginHorizontal: 2,
    minWidth: 120,
    maxWidth: 200,
  },
  fixedRegistrarVendaBtn: {
    backgroundColor: "#FF9800",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    marginHorizontal: 2,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  fixedRegistrarVendaBtnText: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
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
  botaoPressionado: {
    backgroundColor: "#1A2E40",
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  botaoTextoPressionado: {
    color: "#FFF",
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
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
    width: "80%",
  },
  botaoSecundario: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: "#E67E22",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  botaoSecundarioPressionado: {
    backgroundColor: "#f0f0f0",
  },
  botaoSecundarioTexto: {
    color: "#E67E22",
    fontWeight: "600",
    fontSize: 14,
  },
  botaoSecundarioTextoPressionado: {
    color: "#E67E22",
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
})