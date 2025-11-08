import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useCallback, useEffect, useState } from "react"; // Importar useCallback
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Tipo para as entradas (do servidor)
type Entrada = {
  id: string;
  titulo: string;
  data: string;
  imagem: string;
};

// --- NOVO: Tipo para uploads pendentes ---
type PendingUpload = {
  tempId: string; // ID temporário para o React
  fileName: string;
  status: 'pending' | 'error';
  file: any; // O arquivo em si
};

export default function Entradas() {
  const { t } = useLanguage();
  const [arquivoSelecionado, setArquivoSelecionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // --- Estados removidos ---
  // const [showSuccessModal, setShowSuccessModal] = useState(false);
  // const [isProcessing, setIsProcessing] = useState(false);
  // const [processingTime, setProcessingTime] = useState(0);

  // --- NOVO: Estado para uploads pendentes ---
  const [pendingEntradas, setPendingEntradas] = useState<PendingUpload[]>([]);

  // --- Estados para a lista (sem alteração) ---
  const [ultimasEntradas, setUltimasEntradas] = useState<Entrada[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  // --- Função para buscar Entradas (sem alteração) ---
  const buscarEntradas = useCallback(async () => {
    try {
      setLoadingList(true);
      setErrorList(null);
      const entregas = await apiService.entregas.listarPorUsuario();
      const entradasFormatadas = entregas.map((entrega: any, index: number) => ({
        id: entrega.id_documento_entrega || index + 1,
        titulo: entrega.nome_arquivo || `Entrada ${index + 1}`,
        data: entrega.data_entrega
          ? new Date(entrega.data_entrega).toLocaleDateString('pt-BR')
          : new Date().toLocaleDateString('pt-BR'),
        imagem: "https://static.vecteezy.com/system/resources/previews/000/424/651/original/vector-invoice-icon.jpg",
      }));
      setUltimasEntradas(entradasFormatadas.slice(0, 6));
    } catch (error) {
      console.error('❌ Erro ao buscar entradas:', error);
      setErrorList('Erro ao buscar entradas. Tente novamente.');
      setUltimasEntradas([]);
    } finally {
      setLoadingList(false);
    }
  }, []); // Usar useCallback para estabilizar a função

  useEffect(() => {
    buscarEntradas();
  }, [buscarEntradas]);

  // --- NOVO: Função interna para processar o upload ---
  const _runUpload = async (upload: PendingUpload) => {
    try {
      // 1. Tenta fazer o upload
      await apiService.entregas.cadastrar(upload.file);

      // 2. Sucesso: Remove da lista de pendentes
      setPendingEntradas(prev => prev.filter(p => p.tempId !== upload.tempId));

      // 3. Atualiza a lista principal
      await buscarEntradas();

    } catch (error: any) {
      console.error('❌ Erro no upload da entrada:', error);

      // 4. Falha: Atualiza o status do item para 'error'
      setPendingEntradas(prev =>
        prev.map(p =>
          p.tempId === upload.tempId ? { ...p, status: 'error' } : p
        )
      );

      // 5. Alerta o usuário
      Alert.alert(
        "Erro no upload",
        `Não foi possível enviar o arquivo "${upload.fileName}".\n\nDetalhes: ${error.message || 'Erro desconhecido'}`
      );
    }
  };

  // --- Função de seleção de documento (sem alteração) ---
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

  // --- ATUALIZADO: Função de confirmação (agora é assíncrona) ---
  async function confirmarArquivo() {
    if (!arquivoSelecionado) return;

    const fileToUpload = arquivoSelecionado;
    const tempId = `pending-${Date.now()}`;
    const newPendingUpload: PendingUpload = {
      tempId,
      fileName: fileToUpload.name,
      status: 'pending',
      file: fileToUpload,
    };

    // 1. Fecha o modal e limpa a seleção
    setShowModal(false);
    setArquivoSelecionado(null);

    // 2. Adiciona o item à lista de pendentes (UI atualiza)
    setPendingEntradas(prev => [newPendingUpload, ...prev]);

    // 3. Inicia o upload "em segundo plano" (não bloqueia a UI)
    _runUpload(newPendingUpload);
  }

  // --- NOVO: Função para tentar novamente um upload falho ---
  const handleRetryUpload = (item: PendingUpload) => {
    // 1. Reseta o status para 'pending'
    setPendingEntradas(prev =>
      prev.map(p =>
        p.tempId === item.tempId ? { ...p, status: 'pending' } : p
      )
    );
    // 2. Tenta o upload novamente
    _runUpload(item);
  };

  // --- NOVO: Renderizador para itens pendentes ---
  const renderPendingItem = (item: PendingUpload) => (
    <View key={item.tempId} style={[styles.itemContainer, styles.pendingItem]}>
      <View style={styles.itemImage}>
        {/* Mostra o ícone de status */}
        {item.status === 'pending' ? (
          <ActivityIndicator size="small" color="#E67E22" />
        ) : (
          <Ionicons name="warning-outline" size={24} color="#E74C3C" />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.fileName}</Text>
        {item.status === 'pending' ? (
          <Text style={styles.itemDate}>Enviando...</Text>
        ) : (
          <Text style={[styles.itemDate, { color: '#E74C3C' }]}>Falha no envio</Text>
        )}
      </View>
      {/* Botão de Tentar Novamente se falhar */}
      {item.status === 'error' && (
        <TouchableOpacity onPress={() => handleRetryUpload(item)} style={styles.retryButton}>
          <Ionicons name="refresh" size={20} color="#3498DB" />
        </TouchableOpacity>
      )}
    </View>
  );

  // --- Render Item da Lista (sem alteração) ---
  const renderItemLista = ({ item }: { item: Entrada }) => (
    <View style={styles.itemContainer}>
      <Image source={{ uri: item.imagem }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.titulo}</Text>
        <Text style={styles.itemDate}>{item.data}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={"Entradas"} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção de Upload (sem alteração) */}
        <View style={styles.tituloLinha}>
          <Ionicons name="add-circle-outline" size={22} color="#333" />
          <Text style={styles.titulo}>{"Nova Entrada"}</Text>
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
            <Text style={styles.dropText}>{t("addFile")}</Text>
          </View>
        </TouchableOpacity>

        {/* Seção da Lista */}
        <View style={styles.tituloLinha}>
          <Ionicons name="time-outline" size={22} color="#34495E" />
          <Text style={[styles.titulo, { marginTop: 0 }]}>
            {t("Ultimas Entradas")}
          </Text>
        </View>

        {/* --- NOVO: Renderiza a lista de pendentes --- */}
        {pendingEntradas.length > 0 && (
          <View style={styles.grid}>
            {pendingEntradas.map(renderPendingItem)}
          </View>
        )}

        {/* Lista de entradas reais */}
        {loadingList ? (
          <ActivityIndicator size="large" color="#E67E22" style={{marginTop: 20}} />
        ) : errorList ? (
          <Text style={styles.errorText}>{errorList}</Text>
        ) : (
          <FlatList
            data={ultimasEntradas}
            renderItem={renderItemLista}
            keyExtractor={(item) => item.id.toString()}
            numColumns={2}
            scrollEnabled={false}
            columnWrapperStyle={styles.grid}
            ListEmptyComponent={
              pendingEntradas.length === 0 ? ( // Só mostra se pendentes tbm for 0
                <Text style={styles.emptyText}>Nenhuma entrada registrada</Text>
              ) : null
            }
          />
        )}
      </ScrollView>

      {/* Modal de Confirmação (sem alteração) */}
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
                style={[styles.modalBotao, { backgroundColor: "#27AE60" }]}
                onPress={confirmarArquivo} // Esta função agora é assíncrona
              >
                <Text style={styles.modalBotaoTexto}>{t("confirm")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modais de Processing e Success foram REMOVIDOS */}

      <BottomNav />
    </SafeAreaView>
  );
}


// --- ESTILOS ATUALIZADOS ---
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
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    elevation: 3,
  },
  dropInner: { alignItems: "center" },
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
  // Lista
  grid: {
    justifyContent: "space-between",
    gap: 12,
  },
  itemContainer: {
    width: "48%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
    flexDirection: 'row', // Adicionado para alinhar ícone e texto
    alignItems: 'center', // Adicionado
  },
  // NOVO: Estilo para item pendente
  pendingItem: {
    backgroundColor: '#FFF8E1', // Um amarelo claro
    borderColor: '#FFD54F',
    borderWidth: 1,
    width: '100%', // Ocupa a largura toda
  },
  itemImage: {
    width: 40, // Tamanho fixo para ícone ou imagem
    height: 40,
    borderRadius: 8,
    marginRight: 8,
    resizeMode: "cover",
    backgroundColor: '#eee',
    // NOVO: Alinhamento do ActivityIndicator
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemInfo: { flex: 1 },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  // NOVO: Botão de tentar novamente
  retryButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
  // Modais
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