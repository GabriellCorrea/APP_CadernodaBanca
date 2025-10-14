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
  View,
  TouchableOpacity
} from "react-native"
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
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null)
  const [showPaymentTab, setShowPaymentTab] = useState(false)

  // Verifica autenticação quando entra na tela
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

        await apiService.ping()

      } catch (error) {
        const token = await AsyncStorage.getItem('access_token')
        if (!token) router.push("/")
      }
    }

    checkAuth()
  }, [])

  // Busca produto pelo código de barras
  const buscarProduto = async (codigo: string) => {
    const agora = Date.now()
    
    if (agora - lastScanTime < 2000) return
    if (scanned || loading || codigo === lastScannedCode) return
    if (!codigo || codigo.length < 8) return

    setLastScanTime(agora)
    setScanned(true)
    setLoading(true)
    setLastScannedCode(codigo)

    try {
      if (!codigo || codigo.length < 3) throw new Error('Código de barras muito curto ou inválido')
      
      const data = await apiService.buscarRevistaPorCodigoBarras(codigo)

      if (!data) throw { response: { status: 404 } }

      const produtoEncontrado = data["data"] || data
      if (!produtoEncontrado) throw { response: { status: 404 } }
      
      setProduto(produtoEncontrado)
      setCodigoBarras(codigo)
      setShowPaymentTab(true)

      setTimeout(() => setScanned(false), 1000)
    } catch (error: any) {
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

  // Reseta o scanner e limpa método de pagamento
  const resetScanner = () => {
    setProduto(null)
    setCodigoBarras(null)
    setScanned(false)
    setLoading(false)
    setLastScannedCode(null)
    setLastScanTime(0)
    setPaymentMethod(null)
    setShowPaymentTab(false)
  }

  // Confirma venda
  const handleConfirmarVenda = async () => {
    if (!produto || !codigoBarras) {
      Alert.alert(t('error'), t('scanProductFirst'))
      return
    }

    if (!paymentMethod) {
      Alert.alert('Atenção', 'Selecione a forma de pagamento antes de confirmar.')
      setShowPaymentTab(true)
      return
    }

    setLoading(true)
    try {
      const preco = produto.preco_capa || produto.preco_liquido || produto.preco || 0
      const precoNumerico = parseFloat(preco.toString()) || 0
      
      const agora = new Date()
      const dataFormatada = agora.toISOString().split('T')[0]
      
      const vendaData = {
        metodo_pagamento: paymentMethod,
        codigo_barras: codigoBarras.toString().trim(),
        qtd_vendida: 1,
        desconto_aplicado: 0,
        valor_total: precoNumerico,
        data_venda: dataFormatada,
      }

      if (!vendaData.codigo_barras || vendaData.codigo_barras.length < 3) throw new Error('Código de barras inválido')
      if (!vendaData.valor_total || vendaData.valor_total <= 0 || isNaN(vendaData.valor_total)) throw new Error(`Valor do produto inválido: ${vendaData.valor_total}`)
      if (!vendaData.data_venda) throw new Error('Data da venda não informada')

      await apiService.cadastrarVendaPorCodigo(vendaData)

      Alert.alert(t('success'), t('saleConfirmed'))
      resetScanner()
    } catch (error: any) {
      let mensagemErro = t('saleError')
      if (error.response) {
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

  // Função chamada quando o usuário confirma o método de pagamento na aba/modal
  const confirmarMetodoPagamento = () => {
    if (!paymentMethod) {
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
                      <Text style={styles.selectedPaymentLabel}>Forma de pagamento:</Text>
                      <View style={[
                        styles.paymentBadge,
                        paymentMethod === 'Débito' && styles.paymentDebit,
                        paymentMethod === 'Crédito' && styles.paymentCredit,
                        (paymentMethod === 'Pix' || paymentMethod === 'Dinheiro') && styles.paymentBlack
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

      {/* Modal POPUP para seleção de Método de Pagamento */}
      <Modal
        visible={showPaymentTab}
        animationType="fade"
        transparent
        onRequestClose={() => {
          // fecha modal pelo botão de hardware (Android)
          setPaymentMethod(null)
          setShowPaymentTab(false)
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.paymentTabTitle}>Método de Pagamento</Text>

            <View style={styles.paymentOptionsRow}>
              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'Débito' ? styles.paymentOptionSelected : null,
                  { backgroundColor: '#E8F6EA' }
                ]}
                onPress={() => setPaymentMethod('Débito')}
              >
                <Text style={[styles.paymentOptionText, { color: '#2E7D32', fontWeight: paymentMethod === 'Débito' ? '700' : '600' }]}>Débito</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.paymentOption,
                  paymentMethod === 'Crédito' ? styles.paymentOptionSelected : null,
                  { backgroundColor: '#FDECEA' }
                ]}
                onPress={() => setPaymentMethod('Crédito')}
              >
                <Text style={[styles.paymentOptionText, { color: '#C62828', fontWeight: paymentMethod === 'Crédito' ? '700' : '600' }]}>Crédito</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentOptionsRow}>
              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'Pix' ? styles.paymentOptionSelected : null]}
                onPress={() => setPaymentMethod('Pix')}
              >
                <Text style={[styles.paymentOptionText, { color: '#000', fontWeight: paymentMethod === 'Pix' ? '700' : '600' }]}>Pix</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.paymentOption, paymentMethod === 'Dinheiro' ? styles.paymentOptionSelected : null]}
                onPress={() => setPaymentMethod('Dinheiro')}
              >
                <Text style={[styles.paymentOptionText, { color: '#000', fontWeight: paymentMethod === 'Dinheiro' ? '700' : '600' }]}>Dinheiro</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.paymentTabActions}>
              <TouchableOpacity
                style={styles.botaoSecundario}
                onPress={() => {
                  // cancelar seleção: limpa método e fecha modal
                  setPaymentMethod(null)
                  setShowPaymentTab(false)
                }}
              >
                <Text style={styles.botaoSecundarioTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.fixedRegistrarMetodoBtn,
                  { opacity: paymentMethod ? 1 : 0.6 }
                ]}
                onPress={confirmarMetodoPagamento}
                disabled={!paymentMethod}
              >
                <Text style={styles.fixedRegistrarVendaBtnText}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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