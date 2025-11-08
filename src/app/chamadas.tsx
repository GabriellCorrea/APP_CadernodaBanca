import { BottomNav } from "@/components/barra_navegacao";
import { CardRevista } from "@/components/card_revista";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Chamadas() {
  const { t } = useLanguage();
  const [arquivoSelecionado, setArquivoSelecionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [processingTime, setProcessingTime] = useState(0);

  const chamadas = [
    {
      id: 1,
      titulo: "Vogue Michael Jackson",
      preco: 5000,
      vendas: 140,
      estoque: 150,
      imagem:
        "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UF1000,1000_QL80_.jpg",
    },
    {
      id: 2,
      titulo: "Complex Lana del Rey",
      preco: 5000,
      vendas: 140,
      estoque: 100,
      imagem:
        "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UF1000,1000_QL80_.jpg",
    },
    {
      id: 3,
      titulo: "Bravo 10 anos",
      preco: 3000,
      vendas: 120,
      estoque: 80,
      imagem:
        "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UF1000,1000_QL80_.jpg",
    },
    {
      id: 4,
      titulo: "Criativa Esporte",
      preco: 2500,
      vendas: 100,
      estoque: 90,
      imagem:
        "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UF1000,1000_QL80_.jpg",
    },
  ];

  async function handlePickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = (result as any).assets?.[0] ?? result;

      if (!file || !file.uri) return;

      setArquivoSelecionado(file);
      setShowModal(true);
    } catch {
      Alert.alert(t("error"), t("filePickError"));
    }
  }

  async function confirmarArquivo() {
    if (!arquivoSelecionado) return;

    // Log do arquivo selecionado
    console.log('📁 Arquivo selecionado:');
    console.log('  - Nome:', arquivoSelecionado.name);
    console.log('  - Tamanho:', arquivoSelecionado.size, 'bytes');
    console.log('  - Tamanho (MB):', (arquivoSelecionado.size / 1024 / 1024).toFixed(2), 'MB');
    console.log('  - Tipo:', arquivoSelecionado.mimeType);

    setShowModal(false);
    setIsProcessing(true);
    setProcessingStep(1);
    
    try {
      console.log('📤 Iniciando upload do arquivo...');
      await apiService.devolucoes.cadastrar(arquivoSelecionado);
      console.log('✅ Upload e processamento concluídos!');
      
      setIsProcessing(false);
      setShowSuccessModal(true);
      setArquivoSelecionado(null);
      
      // Oculta modal de sucesso após 2 segundos
      setTimeout(() => {
        setShowSuccessModal(false);
      }, 2000);
      
    } catch (error: any) {
      console.error('❌ Erro no upload:', error);
      setIsProcessing(false);
      
      // Tratamento detalhado de erros
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        Alert.alert(
          "Timeout", 
          `O upload demorou mais que o esperado.\n\nPossíveis causas:\n• Arquivo muito grande\n• Conexão lenta\n• Servidor sobrecarregado\n\nTente:\n• Arquivo menor\n• Conexão mais estável\n• Aguardar alguns minutos`
        );
      } else if (error.response?.status === 413) {
        Alert.alert(
          "Arquivo muito grande", 
          "O servidor rejeitou o arquivo por ser muito grande. Tente com um arquivo menor."
        );
      } else if (error.response?.status === 500 || error.code === 'SERVER_ERROR_500') {
        const serverMessage = error.response?.data?.message || error.message || 'Erro desconhecido do servidor';
        Alert.alert(
          "Erro do Servidor (500)", 
          `O servidor encontrou um problema ao processar o arquivo.\n\n` +
          `Detalhes: ${serverMessage}\n\n` +
          `Possíveis soluções:\n` +
          `• Verifique se o arquivo não está corrompido\n` +
          `• Tente novamente em alguns minutos\n` +
          `• Use um arquivo diferente\n` +
          `• Contate o suporte se o problema persistir`
        );
      } else if (error.response?.status === 401) {
        Alert.alert(
          "Não autorizado", 
          "Sua sessão expirou. Faça login novamente."
        );
      } else if (!error.response && error.message?.includes('Network Error')) {
        Alert.alert(
          "Erro de rede", 
          "Verifique sua conexão com a internet e tente novamente."
        );
      } else {
        Alert.alert(
          "Erro no upload", 
          `${t("fileUploadError")}\n\nCódigo: ${error.code || 'N/A'}\nStatus: ${error.response?.status || 'N/A'}\nDetalhes: ${error.message || 'Erro desconhecido'}`
        );
      }
    }
  }

  // Hook para contar tempo de processamento
  useEffect(() => {
    if (isProcessing) {
      setProcessingTime(0);
      const interval = setInterval(() => {
        setProcessingTime(prev => prev + 1);
      }, 1000);
      
      return () => clearInterval(interval);
    }
  }, [isProcessing]);

  // Função para formatar tempo
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t("calls")} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tituloLinha}>
          <Ionicons name="refresh-circle-outline" size={22} color="#333" />
          <Text style={styles.titulo}>{t("newCall")}</Text>
        </View>

        <TouchableOpacity
          activeOpacity={0.85}
          style={styles.dropZone}
          onPress={handlePickDocument}
        >
          <View style={styles.dropInner}>
            <View style={styles.dropIconBox}>
              <Ionicons name="document-attach-outline" size={40} color="#34495E" />
            </View>
            <Text style={styles.dropText}>{t("addFile") || "Adicionar Arquivo"}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.tituloLinha}>
          <Ionicons name="time-outline" size={22} color="#34495E" />
          <Text style={[styles.titulo, { marginTop: 0 }]}>
            {t("lastRegisteredCalls")}
          </Text>
        </View>

        <View style={styles.grid}>
          {chamadas.map((p) => (
            <View style={styles.cardContainer} key={p.id}>
              <CardRevista
                imagem={p.imagem}
                titulo={p.titulo}
                preco={p.preco}
                vendas={p.vendas}
                estoque={p.estoque}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="document-attach-outline" size={40} color="#34495E" />
            <Text style={styles.modalTitulo}>{t("confirmFile")}</Text>
            {arquivoSelecionado && (
              <Text style={styles.modalTexto}>{arquivoSelecionado.name}</Text>
            )}

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotao, { backgroundColor: "#ccc" }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBotaoTexto}>{t("cancel")}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBotao, { backgroundColor: "#E53935" }]}
                onPress={confirmarArquivo}
              >
                <Text style={styles.modalBotaoTexto}>{t("confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal de processamento */}
      <Modal transparent visible={isProcessing} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <ActivityIndicator size="large" color="#4CAF50" />
            <Text style={styles.modalTitulo}>
              {t("processingFile")}
            </Text>
            <Text style={styles.modalTexto}>
              {t("pleaseWaitSending")}
            </Text>
            <Text style={styles.timeCounter}>
              {t("elapsedTime")} {formatTime(processingTime)}
            </Text>
            <Text style={styles.modalTexto}>
              {arquivoSelecionado && `📁 ${arquivoSelecionado.name} (${(arquivoSelecionado.size / 1024 / 1024).toFixed(2)} MB)`}
            </Text>
          </View>
        </View>
      </Modal>

      {/* Modal de sucesso */}
      <Modal transparent visible={showSuccessModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.successModalContent}>
            <View style={styles.successIcon}>
              <Ionicons name="checkmark-circle" size={60} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>{t("fileUploaded")}</Text>
            <Text style={styles.successMessage}>{t("fileUploadSuccess")}</Text>
          </View>
        </View>
      </Modal>

      <BottomNav />
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  tituloLinha: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 20,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#34495E",
  },

  dropZone: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "rgba(52,73,94,0.35)",
    borderRadius: 12,
    backgroundColor: "#fff",
    paddingVertical: 28,
    paddingHorizontal: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  dropInner: {
    alignItems: "center",
  },
  dropIconBox: {
    width: 74,
    height: 74,
    borderRadius: 8,
    backgroundColor: "#F8F8F8",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  dropText: {
    color: "#34495E",
    fontSize: 20,
    fontWeight: "700",
  },

  /* --- mantive os estilos antigos (não removi para não quebrar nada) --- */
  card: {
    backgroundColor: "#B1BCBF",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    color: "#34495E",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(146, 138, 138, 0.5)",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    color: "#434343",
  },
  botaoArquivo: {
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: "#FFF",
  },
  textoArquivo: {
    marginLeft: 8,
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  botao: {
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: "#FFF",
    flexDirection: "row",
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cardContainer: {
    width: "48%",
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    color: "#34495E",
  },
  modalTexto: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBotao: {
    flex: 1,
    padding: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBotaoTexto: {
    color: "#FFF",
    fontWeight: "600",
  },
  successModalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 30,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#4CAF50",
  },
  successIcon: {
    marginBottom: 15,
  },
  successTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
    textAlign: "center",
  },
  successMessage: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  timeCounter: {
    fontSize: 14,
    color: "#888",
    marginTop: 10,
    textAlign: "center",
    fontWeight: "500",
  },
});
