import { BottomNav } from "@/components/barra_navegacao"
import { Header } from "@/components/header"
import { apiService } from "@/services/api"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { CameraType, CameraView, useCameraPermissions } from "expo-camera"
import { router } from "expo-router"
import { useEffect, useState } from "react"
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"

export default function Vendas() {
  const [facing, setFacing] = useState<CameraType>("back")
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null)
  const [produto, setProduto] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
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
            "Acesso negado",
            "Você precisa fazer login para acessar o scanner de produtos",
            [{ text: "OK", onPress: () => router.push("/") }]
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
    if (scanned || loading || codigo === lastScannedCode) return

    setScanned(true)
    setLoading(true)
    setLastScannedCode(codigo)

    try {
      console.log("📦 Código escaneado:", codigo)
      const data = await apiService.buscarRevistaPorCodigoBarras(codigo)

      if (!data || data.length === 0) {
        throw { response: { status: 404 } }
      }

      const produtoEncontrado = data[0]
      setProduto(produtoEncontrado)
      setCodigoBarras(codigo)
      console.log("✅ Produto encontrado:", produtoEncontrado)

      // Libera novo scan após um tempo
      setTimeout(() => setScanned(false), 1000)
    } catch (error: any) {
      console.error('Erro ao buscar produto:', error)
      setProduto(null)
      setCodigoBarras(null)

      let mensagem = "Produto não encontrado"
      if (error.response?.status === 403) mensagem = "Erro de autenticação. Faça login novamente."
      else if (error.response?.status === 404) mensagem = "Produto não cadastrado no sistema"
      else if (error.response?.status >= 500) mensagem = "Erro no servidor. Tente novamente."

      Alert.alert("Erro", mensagem)

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
  }

  // Confirma venda
  const handleConfirmarVenda = async () => {
    if (!produto || !codigoBarras) {
      Alert.alert("Erro", "Escaneie um produto primeiro")
      return
    }

    setLoading(true)
    try {
      const vendaData = {
        metodo_pagamento: 'Débito',
        codigo_barras: codigoBarras,
        qtd_vendida: 1,
        desconto_aplicado: 0.0,
        valor_total: parseFloat(produto.preco_capa || 0),
        data_venda: new Date().toISOString(),
      }

      // Chama o endpoint para cadastrar a venda
      await apiService.cadastrarVendaPorCodigo(vendaData)

      Alert.alert("Sucesso!", "Venda confirmada com sucesso")
      resetScanner()
    } catch (error) {
      console.error('Erro ao confirmar venda:', error)
      Alert.alert("Erro", "Não foi possível confirmar a venda")
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
          <Text style={{ textAlign: "center" }}>Precisamos da permissão para usar a câmera</Text>
          <Pressable onPress={requestPermission} style={styles.botao}>
            <Text style={styles.botaoTexto}>Permitir</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  // Render principal
  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina="Vendas" />

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
                  {scanned ? "Aguardando..." : "Escaneie um código de barras"}
                </Text>
              </View>
            )}

            {loading && (
              <View style={styles.statusInfo}>
                <ActivityIndicator size="large" color="#E67E22" />
                <Text style={styles.statusTexto}>Buscando produto...</Text>
              </View>
            )}

            {produto && (
              <View style={styles.produtoInfo}>
                <Text style={styles.produtoNome}>{produto.nome}</Text>
                <Text style={styles.produtoPreco}>
                  R$ {parseFloat(produto.preco_capa || 0).toFixed(2)}
                </Text>
                <Text style={styles.codigoBarras}>Código: {codigoBarras}</Text>
              </View>
            )}

            {/* Botões */}
            <View style={styles.botoesContainer}>
              <Pressable
                style={[styles.botao, (!produto || loading) && styles.botaoDisabled]}
                onPress={handleConfirmarVenda}
                disabled={loading || !produto}
              >
                <Text style={styles.botaoTexto}>
                  {loading ? "Processando..." : "Confirmar venda"}
                </Text>
              </Pressable>

              <Pressable
                style={styles.botaoSecundario}
                onPress={resetScanner}
                disabled={loading}
              >
                <Text style={styles.botaoSecundarioTexto}>Novo scan</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </ScrollView>

      <BottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
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