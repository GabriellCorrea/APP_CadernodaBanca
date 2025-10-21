import { BottomNav } from "@/components/barra_navegacao";
import { CardRevista } from "@/components/card_revista";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useState } from "react";
import {
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService } from "@/services/api";

export default function Devolucoes() {
  const { t } = useLanguage();
  const [arquivoSelecionado, setArquivoSelecionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const devolucoes = [
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

    setShowModal(false);
    try {
      await apiService.cadastrarChamada(arquivoSelecionado);

      Alert.alert(t("success"), t("fileUploadSuccess"));
      setArquivoSelecionado(null);
    } catch {
      Alert.alert(t("error"), t("fileUploadError"));
    }
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t("returns")} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.tituloLinha}>
          <Ionicons name="refresh-circle-outline" size={22} color="#333" />
          <Text style={styles.titulo}>{t("newReturn")}</Text>
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
            {t("lastRegisteredReturns")}
          </Text>
        </View>

        <View style={styles.grid}>
          {devolucoes.map((p) => (
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
});

