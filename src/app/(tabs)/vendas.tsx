import { Header } from "@/components/header";
import { ConfirmarVendaView } from "@/components/vendas/ConfirmarVendaView";
import { ScannerView } from "@/components/vendas/ScannerView";
import { VendaPorLista } from "@/components/vendas/VendaPorLista";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
// --- CORREÇÃO AQUI ---
import AsyncStorage from "@react-native-async-storage/async-storage";
// ---------------------
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Button,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export type ProdutoEstoque = {
  id_revista: any;
  nome: string;
  url_revista: string;
  preco_capa: number;
  imagem: any;
  codigo_barras?: string;
  numero_edicao?: number;
};

export default function Vendas() {
  const { t } = useLanguage();
  const [apiOnline, setApiOnline] = useState(true);

  const [produtoSelecionado, setProdutoSelecionado] =
    useState<ProdutoEstoque | null>(null);

  const [failedBarcode, setFailedBarcode] = useState<string | null>(null);
  const [isListModalVisible, setIsListModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
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
    }, [t])
  );

  const handleProdutoSelecionado = (produto: ProdutoEstoque) => {
    if (!produto || !produto.id_revista) {
      Alert.alert(t("error"), "Produto inválido ou não registrado corretamente.");
      return;
    }
    setProdutoSelecionado(produto);
  };

  const handleScanFailed = (barcode: string) => {
    setFailedBarcode(barcode);
    setIsListModalVisible(true);
  };

  const handleProductSelectedFromList = (product: ProdutoEstoque) => {
    setIsListModalVisible(false);

    if (!failedBarcode) return;

    Alert.alert(
      "Associar Código de Barras?",
      `Deseja guardar o código "${failedBarcode}" para a revista "${product.nome}"?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
          onPress: () => setFailedBarcode(null),
        },
        {
          text: "Não, Apenas Vender",
          onPress: () => {
            setFailedBarcode(null);
            handleProdutoSelecionado(product);
          }
        },
        {
          text: "Sim, Associar e Vender",
          onPress: () => handleSaveCodeAndSell(product)
        },
      ]
    );
  };

  const handleSaveCodeAndSell = async (product: ProdutoEstoque) => {
    if (loading || !failedBarcode || !product) return;

    const numero_edicao = (product as any).numero_edicao || product.id_revista;

    const dados = {
      nome: String(product.nome).trim(),
      codigo_barras: String(failedBarcode).trim(),
      numero_edicao: Number(numero_edicao),
    };

    if (!dados.nome || !dados.numero_edicao) {
      Alert.alert(t("error"), "Dados do produto inválidos para associação.");
      return;
    }
    try {
      setLoading(true);
      await apiService.revistas.cadastrarCodigo(dados);
      Alert.alert(t("success"), "Código de barras associado com sucesso!"); // Usar i18n se tiver

      const produtoAtualizado = { ...product, codigo_barras: failedBarcode };
      handleProdutoSelecionado(produtoAtualizado);
    } catch (error) {
      Alert.alert(t("error"), "Falha ao associar código de barras."); // Usar i18n se tiver
    } finally {
      setLoading(false);
      setFailedBarcode(null);
    }
  };

  const handleCancelarVenda = () => {
    setProdutoSelecionado(null);
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t("salesPage")} />

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFF" />
          <Text style={styles.loadingText}>{t('savingCode')}</Text>
        </View>
      )}

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
                <ScannerView
                  onScanSuccess={handleProdutoSelecionado}
                  onScanFail={handleScanFailed}
                  apiOnline={apiOnline}
                />
              ) : (
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

      <Modal
        visible={isListModalVisible}
        animationType="slide"
        onRequestClose={() => setIsListModalVisible(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>{t('productNotFound')}</Text>
          <Text style={styles.modalSubtitle}>
            {t('selectProduct')}:
          </Text>

          <VendaPorLista
            onProdutoSelecionado={handleProductSelectedFromList}
          />

          <Button
            title={t('closeModal')}
            onPress={() => {
              setIsListModalVisible(false);
              setFailedBarcode(null);
            }}
            color="#E67E22"
          />
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

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
  modalContainer: {
    flex: 1,
    padding: 16,
    backgroundColor: "#F8F8F8",
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 8,
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#555",
    marginBottom: 16,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
  },
  loadingText: {
    color: "#FFF",
    marginTop: 10,
    fontSize: 16,
  },
});