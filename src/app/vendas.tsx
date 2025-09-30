import { useState, useEffect } from "react"
import { CameraView, CameraType, useCameraPermissions } from "expo-camera"
import { View, StyleSheet, Pressable, Text, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/barra_navegacao"
import { apiService } from "@/services/api"

export default function Vendas() {
  const [facing, setFacing] = useState<CameraType>("back") // câmera traseira por padrão
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null)
  const [produto, setProduto] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [permission, requestPermission] = useCameraPermissions()

  // Função para buscar produto por código de barras
  const buscarProduto = async (codigo: string) => {
    if (scanned || loading) return
    
    setScanned(true)
    setLoading(true)
    
    try {
      console.log('Código escaneado:', codigo)
      const produtoData = await apiService.getProductByBarcode(codigo)
      setProduto(produtoData)
      setCodigoBarras(codigo)
      
      // Não mostra alert de sucesso, apenas atualiza a tela
      console.log('Produto encontrado:', produtoData)
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      setProduto(null)
      setCodigoBarras(null)
      
      // Mostra erro apenas uma vez
      Alert.alert(
        "Produto não encontrado", 
        "Tente escanear outro código",
        [
          { 
            text: "OK", 
            onPress: () => {
              // Reseta para permitir novo scan após 2 segundos
              setTimeout(() => {
                setScanned(false)
              }, 2000)
            }
          }
        ]
      )
    } finally {
      setLoading(false)
    }
  }

  // Função para resetar scanner
  const resetScanner = () => {
    setProduto(null)
    setCodigoBarras(null)
    setScanned(false)
    setLoading(false)
  }

  // Função para confirmar venda
  const handleConfirmarVenda = async () => {
    if (!produto) {
      Alert.alert("Erro", "Escaneie um produto primeiro")
      return
    }

    setLoading(true)
    try {
      const vendaData = {
        produto_id: produto.id,
        codigo_barras: codigoBarras,
        quantidade: 1,
        preco_unitario: produto.preco,
        total: produto.preco
      }
      
      await apiService.confirmarVenda(vendaData)
      Alert.alert("Sucesso!", "Venda confirmada com sucesso")
      resetScanner()
    } catch (error) {
      console.error('Erro ao confirmar venda:', error)
      Alert.alert("Erro", "Não foi possível confirmar a venda")
    } finally {
      setLoading(false)
    }
  }

  // enquanto não tiver permissão
  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.container}>
          <Text style={{ textAlign: "center" }}>
            Precisamos da permissão para usar a câmera
          </Text>
          <Pressable onPress={requestPermission} style={styles.botao}>
            <Text style={styles.botaoTexto}>Permitir</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      {/* Header */}
      <Header
        usuario="Andreas"
        pagina="Início"
      />

      {/* Card central */}
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Espaço da foto (agora câmera) */}
          <CameraView
            style={styles.fotoBox}
            facing={facing}
            barcodeScannerSettings={{
              barcodeTypes: ['code128', 'ean13', 'ean8', 'qr'],
            }}
            onBarcodeScanned={(result) => {
              if (result.data) {
                buscarProduto(result.data)
              }
            }}
          />
          
          {loading && (
            <ActivityIndicator size="large" color="#E67E22" style={{ marginVertical: 10 }} />
          )}
          
          {produto && (
            <View style={styles.produtoInfo}>
              <Text style={styles.produtoNome}>{produto.nome || produto.title}</Text>
              <Text style={styles.produtoPreco}>R$ {produto.preco?.toFixed(2) || '0.00'}</Text>
              <Text style={styles.codigoBarras}>Código: {codigoBarras}</Text>
            </View>
          )}

          {/* Botões */}
          <View style={styles.botoesContainer}>
            <Pressable
              style={({ pressed }) => [
                styles.botao,
                pressed && styles.botaoPressionado,
                !produto && styles.botaoDisabled
              ]}
              onPress={handleConfirmarVenda}
              disabled={loading || !produto}
            >
              {({ pressed }) => (
                <Text
                  style={[
                    styles.botaoTexto,
                    pressed && styles.botaoTextoPressionado,
                  ]}
                >
                  {loading ? "Processando..." : "Confirmar venda"}
                </Text>
              )}
            </Pressable>

            <Pressable
              style={({ pressed }) => [
                styles.botaoSecundario,
                pressed && styles.botaoSecundarioPressionado,
              ]}
              onPress={resetScanner}
              disabled={loading}
            >
              {({ pressed }) => (
                <Text
                  style={[
                    styles.botaoSecundarioTexto,
                    pressed && styles.botaoSecundarioTextoPressionado,
                  ]}
                >
                  Novo scan
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>

      {/* Bottom nav */}
      <BottomNav />
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
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
})