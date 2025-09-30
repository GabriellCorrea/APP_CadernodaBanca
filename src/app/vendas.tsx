import { useState, useEffect } from "react"
import { CameraView, CameraType, useCameraPermissions } from "expo-camera"
import { View, StyleSheet, Pressable, Text, Alert, ActivityIndicator } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/barra_navegacao"
import { apiService } from "@/services/api"
import { router } from "expo-router"
import AsyncStorage from "@react-native-async-storage/async-storage"

export default function Vendas() {
  const [facing, setFacing] = useState<CameraType>("back") // câmera traseira por padrão
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null)
  const [produto, setProduto] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [scanned, setScanned] = useState(false)
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null)
  const [permission, requestPermission] = useCameraPermissions()

  // Verifica autenticação quando o componente iniciar
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Primeiro verifica se tem token salvo
        const token = await AsyncStorage.getItem('authToken');
        
        if (!token) {
          console.log('Usuário não autenticado - redirecionando para login');
          Alert.alert(
            "Acesso negado", 
            "Você precisa fazer login para acessar o scanner de produtos",
            [
              {
                text: "OK",
                onPress: () => router.push("/")
              }
            ]
          );
          return;
        }
        
        console.log('Token encontrado:', token ? `${token.substring(0, 20)}...` : 'Nenhum token');
        
        // Se tem token, testa a API
        console.log('Testando conectividade da API...');
        await apiService.testConnection();
        console.log('API está acessível');
        
      } catch (error) {
        console.error('Erro na verificação de auth/API:', error);
        // Se deu erro na API mas tem token, continua (pode ser problema de rede)
        const token = await AsyncStorage.getItem('authToken');
        if (!token) {
          router.push("/");
        }
      }
    };
    
    checkAuth();
  }, [])

  // Função para buscar produto por código de barras
  const buscarProduto = async (codigo: string) => {
    // Evita scan do mesmo código ou múltiplos scans
    if (scanned || loading || codigo === lastScannedCode) return
    
    console.log('Código escaneado:', codigo)
    setScanned(true)
    setLoading(true)
    setLastScannedCode(codigo)
    
    try {
      const produtoData = await apiService.getProductByBarcode(codigo)
      setProduto(produtoData)
      setCodigoBarras(codigo)
      console.log('Produto encontrado:', produtoData)
      
      // Libera para novo scan após encontrar produto
      setTimeout(() => {
        setScanned(false)
      }, 1000)
      
    } catch (error: any) {
      console.error('Erro ao buscar produto:', error)
      setProduto(null)
      setCodigoBarras(null)
      
      // Mostra erro específico baseado no status
      let mensagemErro = "Produto não encontrado";
      if (error.response?.status === 403) {
        mensagemErro = "Erro de autenticação. Faça login novamente.";
      } else if (error.response?.status === 404) {
        mensagemErro = "Produto não cadastrado no sistema";
      } else if (error.response?.status >= 500) {
        mensagemErro = "Erro no servidor. Tente novamente.";
      }
      
      console.log('Mensagem de erro:', mensagemErro);
      
      // Libera para novo scan após erro
      setTimeout(() => {
        setScanned(false)
        setLastScannedCode(null)
      }, 3000)
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
    setLastScannedCode(null)
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
          
          {/* Status do scanner */}
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