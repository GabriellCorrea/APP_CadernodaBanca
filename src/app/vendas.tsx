import { BottomNav } from "@/components/barra_navegacao"
import { Header } from "@/components/header"
import { useLanguage } from "@/contexts/LanguageContext"
import { apiService } from "@/services/api"
import { Ionicons } from "@expo/vector-icons"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { CameraType, CameraView, useCameraPermissions } from "expo-camera"
import { router } from "expo-router"
import { useEffect, useMemo, useState } from "react"
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

// --- Tipos ---
type ProdutoEstoque = {
  id_revista: any
  nome: string
  url_revista: string
  preco_capa: number // Adicionado para consistência
  imagem: any  
  codigo_barras?: string
}

type VendaPorListaProps = {
  onProdutoSelecionado: (produto: ProdutoEstoque) => void
}

// ========================================================================
// COMPONENTE 1: ScannerView
// (Definido dentro de vendas.tsx)
// ========================================================================
type ScannerViewProps = {
  onProdutoSelecionado: (produto: any) => void
  apiOnline: boolean
}

function ScannerView({ onProdutoSelecionado, apiOnline }: ScannerViewProps) {
  const { t } = useLanguage()
  const [facing, setFacing] = useState<CameraType>("back")
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [lastScanTime, setLastScanTime] = useState<number>(0)
  const [permission, requestPermission] = useCameraPermissions()

  const buscarProduto = async (codigo: string) => {
    const agora = Date.now()
    if (agora - lastScanTime < 2000) return // Throttle
    if (scanned || loading || codigo === lastScannedCode) return
    if (!codigo || typeof codigo !== "string") return
    const codigoLimpo = codigo.trim()
    if (codigoLimpo.includes("://") || codigoLimpo.includes("exp://")) return
    if (codigoLimpo.length < 8 || codigoLimpo.length > 18) return
    console.log("🔍 Código escaneado:", codigoLimpo)
    if (!/^\d+$/.test(codigoLimpo)) return

    setLastScanTime(agora)
    setScanned(true)
    setLoading(true)
    setLastScannedCode(codigoLimpo)

    try {
      const data = await apiService.revistas.buscarPorCodigoBarras(codigoLimpo)

      if (!data) throw { response: { status: 404 } }
      const produtoEncontrado = data["data"] || data

      if (!produtoEncontrado || !produtoEncontrado.id_revista) {
        console.error("Produto encontrado sem ID de revista", produtoEncontrado)
        throw { response: { status: 404 }, message: t("productNotRegistered") }
      }

      // CHAMA A FUNÇÃO PRINCIPAL
      onProdutoSelecionado(produtoEncontrado)

      setTimeout(() => setScanned(false), 1000)
    } catch (error: any) {
      console.error("❌ Erro na busca de produto:", { error })
      let mensagem = error.message || t("productNotFound")
      if (error.response?.status === 404) mensagem = t("productNotRegistered")

      Alert.alert(t("error"), mensagem, [
        {
          text: "Cancelar",
          style: "cancel" as const,
          onPress: () => {
            setScanned(false)
            setLastScannedCode(null)
          },
        },
      ])
      setTimeout(() => {
        setScanned(false)
        setLastScannedCode(null)
      }, 5000)
    } finally {
      setLoading(false)
    }
  }

  // --- Render de Permissão ---
  if (!permission) return <View />
  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={{ textAlign: "center", padding: 20 }}>
          {t("cameraPermissionNeeded")}
        </Text>
        <Pressable onPress={requestPermission} style={styles.botao}>
          <Text style={styles.botaoTexto}>{t("allow")}</Text>
        </Pressable>
      </View>
    )
  }

  // --- Render do Scanner ---
  return (
    <>
      <CameraView
        style={styles.fotoBox}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["code128", "ean13", "ean8", "qr"],
        }}
        onBarcodeScanned={(result) => {
          if (result.data) buscarProduto(result.data)
        }}
      />
      {!loading && (
        <View style={styles.statusInfo}>
          <Text style={styles.statusTexto}>
            {scanned ? t("waiting") : t("scanBarcode")}
          </Text>
        </View>
      )}
      {loading && (
        <View style={styles.statusInfo}>
          <ActivityIndicator size="large" color="#E67E22" />
          <Text style={styles.statusTexto}>{t("searchingProduct")}</Text>
        </View>
      )}
    </>
  )
}

// ========================================================================
// COMPONENTE 2: VendaPorLista
// (Definido dentro de vendas.tsx)
// ========================================================================
function VendaPorLista({ onProdutoSelecionado }: VendaPorListaProps) {
  const { t } = useLanguage()
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([])
  const [busca, setBusca] = useState("")
  const [loadingProdutos, setLoadingProdutos] = useState(true)

  useEffect(() => {
    async function carregarEstoque() {
      try {
        setLoadingProdutos(true)
        const data = await apiService.revistas.estoque()
        setProdutos(data || [])
      } catch (error) {
        console.error("Erro ao carregar estoque para venda:", error)
        Alert.alert(t("error"), "Não foi possível carregar os produtos.")
      } finally {
        setLoadingProdutos(false)
      }
    }
    carregarEstoque()
  }, [t])

  const produtosFiltrados = useMemo(() => {
    if (!busca) return produtos
    return produtos.filter((p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    )
  }, [busca, produtos])

  const renderItem = ({ item }: { item: ProdutoEstoque }) => {
    if(item.url_revista && typeof item.url_revista === 'string') {
      const separator = item.url_revista.includes('?') ? '&' : '?';
      const cacheBustedUrl = `${item.url_revista}${separator}timestamp=${new Date().getTime()}`;
    item = {...item, imagem: { uri: cacheBustedUrl } };
    }
    return (
    <TouchableOpacity
      style={styles.itemLista}
      onPress={() => onProdutoSelecionado(item)} // CHAMA A FUNÇÃO PRINCIPAL
    >
      <Image
        source={
          item.imagem
            ? item.imagem
            : require("../../assets/images/imagem-placeholder.png")
        }
        style={styles.itemImagem}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemNome}>{item.nome}</Text>
        <Text style={styles.itemPreco}>
          R$ {(item.preco_capa).toFixed(2)}
        </Text>
      </View>
      <Ionicons name="add-circle" size={32} color="#E67E22" />
    </TouchableOpacity>)
  }

  return (
    <View style={styles.listaContainer}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("searchMagazine")}
          placeholderTextColor="#666"
          value={busca}
          onChangeText={setBusca}
        />
      </View>
      {loadingProdutos ? (
        <ActivityIndicator
          size="large"
          color="#E67E22"
          style={{ marginTop: 20 }}
        />
      ) : (
        <FlatList
          data={produtosFiltrados}
          renderItem={renderItem}
          keyExtractor={(item) => item.id_revista.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          ListEmptyComponent={
            <Text style={styles.listaVaziaText}>{t("noMagazineFound")}</Text>
          }
        />
      )}
    </View>
  )
}

// ========================================================================
// COMPONENTE 3: ConfirmarVendaView
// (Definido dentro de vendas.tsx)
// ========================================================================
type ConfirmarVendaViewProps = {
  produto: ProdutoEstoque
  onCancelar: () => void
  apiOnline: boolean
  setApiOnline: (status: boolean) => void
}

function ConfirmarVendaView({
  produto,
  onCancelar,
  apiOnline,
  setApiOnline,
}: ConfirmarVendaViewProps) {
  const { t } = useLanguage()
  const [quantidade, setQuantidade] = useState("1")
  const [desconto, setDesconto] = useState("0")
  const [metodoPagamento, setMetodoPagamento] = useState<string | null>(null) // "Débito", "Crédito", "Pix", "Dinheiro"
  const [loading, setLoading] = useState(false)

  // Cálculo do valor total
  const valorTotal = useMemo(() => {
    const preco = parseFloat(
      (produto.preco_capa || produto.preco_capa || 0).toString()
    )
    const qtd = parseInt(quantidade) || 0
    const desc = parseFloat(desconto.replace(",", ".")) || 0 // Aceita vírgula
    return Math.max(0, preco * qtd - desc)
  }, [produto, quantidade, desconto])

  const handleConfirmarVenda = async () => {
    // 1. Validação
    if (!metodoPagamento) {
      Alert.alert(t("error"), "Por favor, selecione um método de pagamento.")
      return
    }
    const qtdNum = parseInt(quantidade)
    if (isNaN(qtdNum) || qtdNum <= 0) {
      Alert.alert(t("error"), "Quantidade deve ser um número maior que zero.")
      return
    }
    const descNum = parseFloat(desconto.replace(",", ".")) || 0
    if (isNaN(descNum) || descNum < 0) {
      Alert.alert(t("error"), "Desconto inválido. Use 0 se não houver desconto.")
      return
    }
    if (valorTotal < 0) {
      Alert.alert(
        t("error"),
        "Valor total não pode ser negativo. Verifique o desconto."
      )
      return
    }

    setLoading(true)

    // 2. Montar Payload (Conforme especificado)
    const payload = {
      id_revista: produto.id_revista,
      metodo_pagamento: metodoPagamento,
      qtd_vendida: qtdNum,
      desconto_aplicado: descNum,
      valor_total: valorTotal,
      data_venda: new Date().toISOString(),
    }

    console.log("🚀 Enviando Payload de Venda:", payload)

    // 3. Enviar API
    try {
      await apiService.vendas.cadastrarPorId(payload)
      setApiOnline(true)
      Alert.alert(t("success"), t("saleConfirmed"), [
        { text: t("ok"), onPress: onCancelar }, // 'onCancelar' reseta o state principal
      ])
    } catch (error: any) {
      console.error("❌ Erro detalhado na venda:", {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
      })

      let mensagemErro = t("saleError")
      if (error.response?.status === 422) {
        const details = error.response?.data?.detail
        if (Array.isArray(details) && details[0]?.msg) {
          const field = details[0].loc?.[1] || "desconhecido"
          mensagemErro = `Dados inválidos: ${details[0].msg} (Campo: ${field})`
        } else {
          mensagemErro = `Dados inválidos (422). Verifique o payload enviado.`
        }
      } else if (!error.response) {
        mensagemErro = "Sem conexão com a internet."
        setApiOnline(false)
      } else if (error.message) {
        mensagemErro = `Erro: ${error.message}`
      }

      Alert.alert(t("error"), mensagemErro, [
        { text: "Cancelar", style: "cancel" },
      ])
    } finally {
      setLoading(false)
    }
  }

  const precoUnitario = parseFloat(
    (produto.preco_capa || 0 ).toString()
  ).toFixed(2)

  return (
    <View style={styles.confirmationContainer}>
      <Text style={styles.confirmTitle}>{t("confirmSale")}</Text>

      {/* Detalhes do Produto */}
      <View style={styles.produtoInfo}>
        <Text style={styles.produtoNome}>{produto.nome}</Text>
        <Text style={styles.produtoPreco}>
          Preço Unitário: R$ {precoUnitario}
        </Text>
        {produto.codigo_barras && (
           <Text style={styles.codigoBarras}>{t('code')}: {produto.codigo_barras}</Text>
        )}
      </View>

      {/* Inputs */}
      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.input}
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
            selectTextOnFocus
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Desconto (R$)</Text>
          <TextInput
            style={styles.input}
            value={desconto}
            onChangeText={setDesconto}
            keyboardType="decimal-pad"
            selectTextOnFocus
          />
        </View>
      </View>

      {/* Pagamento */}
      <Text style={styles.label}>Método de Pagamento</Text>
      <View style={styles.paymentOptionsRow}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            metodoPagamento === "Débito" && styles.paymentOptionSelected,
            { backgroundColor: "#E8F6EA" },
          ]}
          onPress={() => setMetodoPagamento("Débito")}
        >
          <Text style={[styles.paymentOptionText, { color: "#2E7D32" }]}>
            {t("debit")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            metodoPagamento === "Crédito" && styles.paymentOptionSelected,
            { backgroundColor: "#FDECEA" },
          ]}
          onPress={() => setMetodoPagamento("Crédito")}
        >
          <Text style={[styles.paymentOptionText, { color: "#C62828" }]}>
            {t("credit")}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.paymentOptionsRow}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            metodoPagamento === "Pix" && styles.paymentOptionSelected,
          ]}
          onPress={() => setMetodoPagamento("Pix")}
        >
          <Text style={[styles.paymentOptionText, { color: "#000" }]}>
            {t("pix")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            metodoPagamento === "Dinheiro" && styles.paymentOptionSelected,
          ]}
          onPress={() => setMetodoPagamento("Dinheiro")}
        >
          <Text style={[styles.paymentOptionText, { color: "#000" }]}>
            {t("cash")}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total */}
      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Valor Total:</Text>
        <Text style={styles.totalValor}>R$ {valorTotal.toFixed(2)}</Text>
      </View>

      {/* Ações */}
      <View style={[styles.botoesContainer, { marginTop: 20 }]}>
        <TouchableOpacity
          style={[styles.botaoAcao, styles.botaoCancelar]}
          onPress={onCancelar}
          disabled={loading}
        >
          <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoAcao,
            styles.fixedRegistrarVendaBtn,
            (loading || !metodoPagamento) && styles.botaoDisabled,
          ]}
          onPress={handleConfirmarVenda}
          disabled={loading || !metodoPagamento}
        >
          <Text style={styles.fixedRegistrarVendaBtnText}>
            {loading ? t("processing") : t("confirmSale")}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

// ========================================================================
// COMPONENTE PRINCIPAL: Vendas
// (Este é o `export default` do arquivo `vendas.tsx`)
// ========================================================================
export default function Vendas() {
  const { t } = useLanguage()
  const [apiOnline, setApiOnline] = useState(true)

  // Estado principal que controla a tela
  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoEstoque | null>(null)

  // Estado que controla o seletor (scanner ou lista)
  const [viewMode, setViewMode] = useState<"scanner" | "list">("scanner")

  // Efeito para checar auth e API
  useEffect(() => {
    const checkAuthAndApi = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token")
        if (!token) {
          Alert.alert(
            t("accessDenied"),
            t("loginRequired"),
            [{ text: t("ok"), onPress: () => router.push("/") }]
          )
          return
        }
        await apiService.utils.ping()
        setApiOnline(true)
      } catch (error) {
        setApiOnline(false)
        const token = await AsyncStorage.getItem("access_token")
        if (!token) router.push("/")
      }
    }
    checkAuthAndApi()
  }, [t])

  // Função para "navegar" para a tela de confirmação
  const handleProdutoSelecionado = (produto: any) => {
    if (!produto || !produto.id_revista) {
      Alert.alert(t("error"), "Produto inválido ou não registrado corretamente.")
      return
    }
    setProdutoSelecionado(produto)
  }

  // Função para "voltar" para a tela de seleção
  const handleCancelarVenda = () => {
    setProdutoSelecionado(null)
  }

  // Render Principal
  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t("salesPage")} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.scrollContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <View style={styles.container}>
          <View style={styles.card}>
            {/* Status da API */}
            {!apiOnline && (
              <View
                style={[
                  styles.statusInfo,
                  {
                    backgroundColor: "#fff3cd",
                    borderLeftColor: "#ffc107",
                    minHeight: 0,
                    padding: 10,
                    marginBottom: 10
                  },
                ]}
              >
                <Text style={[styles.statusTexto, { color: "#856404", marginTop: 0 }]}>
                  ⚠️ API indisponível.
                </Text>
              </View>
            )}

            {/* RENDER CONDICIONAL */}
            {!produtoSelecionado ? (
              // --- TELA 1: SELEÇÃO DE PRODUTO ---
              <>
                <View style={styles.viewModeSelector}>
                  <TouchableOpacity
                    style={[
                      styles.viewModeButton,
                      viewMode === "scanner" && styles.viewModeButtonActive,
                    ]}
                    onPress={() => setViewMode("scanner")}
                  >
                    <Ionicons
                      name="camera-outline"
                      size={20}
                      color={viewMode === "scanner" ? "#fff" : "#E67E22"}
                    />
                    <Text
                      style={[
                        styles.viewModeText,
                        viewMode === "scanner" && styles.viewModeTextActive,
                      ]}
                    >
                      Scanner
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.viewModeButton,
                      viewMode === "list" && styles.viewModeButtonActive,
                    ]}
                    onPress={() => setViewMode("list")}
                  >
                    <Ionicons
                      name="list-outline"
                      size={20}
                      color={viewMode === "list" ? "#fff" : "#E67E22"}
                    />
                    <Text
                      style={[
                        styles.viewModeText,
                        viewMode === "list" && styles.viewModeTextActive,
                      ]}
                    >
                      Lista
                    </Text>
                  </TouchableOpacity>
                </View>

                {viewMode === "scanner" && (
                  <ScannerView
                    onProdutoSelecionado={handleProdutoSelecionado}
                    apiOnline={apiOnline}
                  />
                )}

                {viewMode === "list" && (
                  <VendaPorLista
                    onProdutoSelecionado={handleProdutoSelecionado}
                  />
                )}
              </>
            ) : (
              // --- TELA 2: CONFIRMAÇÃO DE VENDA ---
              <ConfirmarVendaView
                produto={produtoSelecionado}
                onCancelar={handleCancelarVenda}
                apiOnline={apiOnline}
                setApiOnline={setApiOnline}
              />
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      <BottomNav />
    </SafeAreaView>
  )
}

// ========================================================================
// ESTILOS
// ========================================================================
const styles = StyleSheet.create({
  // --- Seletor de Modo ---
  viewModeSelector: {
    flexDirection: "row",
    width: "100%",
    marginBottom: 16,
    backgroundColor: "#eee",
    borderRadius: 10,
    padding: 4,
  },
  viewModeButton: {
    flex: 1,
    flexDirection: "row",
    paddingVertical: 10,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
  },
  viewModeButtonActive: {
    backgroundColor: "#E67E22",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  viewModeText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#E67E22",
    marginLeft: 8,
  },
  viewModeTextActive: {
    color: "#fff",
  },

  // --- Estilos da Venda por Lista ---
  listaContainer: {
    width: "100%",
    flex: 1,
    minHeight: 320,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    marginBottom: 12,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#434343",
    fontSize: 16,
  },
  itemLista: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemImagem: {
    width: 40,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    resizeMode: "cover",
    backgroundColor: "#e0e0e0",
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemNome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  itemPreco: {
    fontSize: 13,
    color: "#000",
    marginTop: 2,
  },
  listaVaziaText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 16,
  },

  // --- Estilos de Botões e Ações ---
  botaoAcao: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  botaoCancelar: {
    backgroundColor: "#f1f1f1",
    borderColor: "#ddd",
  },
  botaoCancelarTexto: {
    color: "#555",
    fontWeight: "600",
    fontSize: 14,
  },
  fixedRegistrarVendaBtn: {
    backgroundColor: "#FF9800",
  },
  fixedRegistrarVendaBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  botoesContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    flexShrink: 1,
  },
  botaoDisabled: {
    backgroundColor: "#ccc",
    borderColor: "#bbb",
    opacity: 0.7,
  },

  // --- Estilos de Layout (Wrapper, Container, Card) ---
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollContainer: {
    flex: 1,
  },
  container: {
    flex: 1,
    justifyContent: "flex-start",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    flex: 1,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },

  // --- Estilos do Scanner ---
  fotoBox: {
    width: "100%",
    height: 320,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 0,
  },
  botao: {
    backgroundColor: "#E67E22",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
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

  // --- Estilos de Status e Info ---
  statusInfo: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    width: "100%",
    minHeight: 100,
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

  // --- ESTILOS NOVOS: ConfirmarVendaView ---
  confirmationContainer: {
    flex: 1,
    width: '100%',
    padding: 4,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  produtoInfo: {
    alignItems: "center",
    marginBottom: 16,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: '#eee'
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  produtoPreco: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
    marginTop: 5,
  },
  codigoBarras: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  inputGroup: {
    flex: 1,
  },
  paymentOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: '100%',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  paymentOptionSelected: {
    borderWidth: 2,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  paymentOptionText: {
    fontSize: 15,
    fontWeight: '600'
  },
  totalContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E8F6EA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b2dfdb',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004d40',
  },
  totalValor: {
    fontSize: 22,
    fontWeight: '800',
    color: '#004d40',
    marginTop: 4,
  },
})