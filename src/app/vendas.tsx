import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
// Importa os novos componentes
import { ConfirmarVendaView } from "@/components/vendas/ConfirmarVendaView";
import { ScannerView } from "@/components/vendas/ScannerView";
import { VendaPorLista } from "@/components/vendas/VendaPorLista";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// --- TIPO DEFINIDO E EXPORTADO AQUI ---
export type ProdutoEstoque = {
  id_revista: any;
  nome: string;
  url_revista: string;
  preco_capa: number;
  imagem: any;
  codigo_barras?: string;
};
// -------------------------------------

export default function Vendas() {
  const { t } = useLanguage();
  const [apiOnline, setApiOnline] = useState(true);

  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoEstoque | null>(null);

  const [viewMode, setViewMode] = useState<"scanner" | "list">("scanner");

  useEffect(() => {
    const checkAuthAndApi = async () => {
      try {
        const token = await AsyncStorage.getItem("access_token");
        if (!token) {
          Alert.alert(
            t("accessDenied"),
            t("loginRequired"),
            [{ text: t("ok"), onPress: () => router.push("/") }]
          );
          return;
        }
        await apiService.utils.ping();
        setApiOnline(true);
      } catch (error) {
        setApiOnline(false);
        const token = await AsyncStorage.getItem("access_token");
        if (!token) router.push("/");
      }
    };
    checkAuthAndApi();
  }, [t]);

  const handleProdutoSelecionado = (produto: ProdutoEstoque) => {
    if (!produto || !produto.id_revista) {
      Alert.alert(t("error"), "Produto inválido ou não registrado corretamente.");
      return;
    }
    setProdutoSelecionado(produto);
  };

  const handleCancelarVenda = () => {
    setProdutoSelecionado(null);
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t("salesPage")} />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.scrollContainer}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        <ScrollView contentContainerStyle={styles.scrollContentContainer}>
          <View style={styles.container}>
            <View style={styles.card}>
              {!apiOnline && (
                <View style={styles.apiStatusOffline}>
                  <Text style={styles.apiStatusText}>
                    ⚠️ API indisponível.
                  </Text>
                </View>
              )}

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
        </ScrollView>
      </KeyboardAvoidingView>

      <BottomNav />
    </SafeAreaView>
  );
}

// ========================================================================
// ESTILOS (Apenas os do componente PAI)
// ========================================================================
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  container: {
    justifyContent: "flex-start",
    padding: 16,
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
    width: '100%',
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },

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

  // --- Status da API ---
  apiStatusOffline: {
    backgroundColor: "#fff3cd",
    borderLeftColor: "#ffc107",
    borderLeftWidth: 4,
    minHeight: 0,
    padding: 10,
    marginBottom: 10,
    width: '100%',
    borderRadius: 4,
  },
  apiStatusText: {
    color: "#856404",
    marginTop: 0,
  },
});