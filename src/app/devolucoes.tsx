import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Tipo para Devolução (do servidor)
type Devolucao = {
  id_chamada_devolucao: number;
  data_limite: string;
  status: 'aberta' | 'fechada';
};

// --- NOVO: Tipo para uploads pendentes ---
type PendingUpload = {
  tempId: string; // ID temporário para o React
  fileName: string;
  status: 'pending' | 'error';
  file: any; // O arquivo em si
};

export default function Devolucoes() {
  const { t } = useLanguage();
  const router = useRouter();
  const [arquivoSelecionado, setArquivoSelecionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  // --- Estados removidos ---
  // const [showSuccessModal, setShowSuccessModal] = useState(false);
  // const [isProcessing, setIsProcessing] = useState(false);
  // const [processingTime, setProcessingTime] = useState(0);

  // --- NOVO: Estado para uploads pendentes ---
  const [pendingDevolucoes, setPendingDevolucoes] = useState<PendingUpload[]>([]);

  // --- Estados para a lista (sem alteração) ---
  const [devolucoesAbertas, setDevolucoesAbertas] = useState<Devolucao[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [errorList, setErrorList] = useState<string | null>(null);

  // --- Função para buscar Devoluções (envolvida em useCallback) ---
  const buscarDevolucoes = useCallback(async () => {
    try {
      setLoadingList(true);
      setErrorList(null);
      const devolucoes = await apiService.devolucoes.listarPorUsuario();
      const abertas = devolucoes.filter((d: Devolucao) => d.status === 'aberta');
      setDevolucoesAbertas(abertas);
    } catch (error) {
      console.error('❌ Erro ao buscar devoluções:', error);
      setErrorList('Erro ao buscar devoluções. Tente novamente.');
      setDevolucoesAbertas([]);
    } finally {
      setLoadingList(false);
    }
  }, []); // useCallback

  useFocusEffect(
    React.useCallback(() => {
      buscarDevolucoes();
    }, [buscarDevolucoes])
  );

  // --- NOVO: Função interna para processar o upload ---
  const _runUpload = async (upload: PendingUpload) => {
    try {
      // 1. Tenta fazer o upload
      await apiService.devolucoes.cadastrar(upload.file);

      // 2. Sucesso: Remove da lista de pendentes
      setPendingDevolucoes(prev => prev.filter(p => p.tempId !== upload.tempId));

      // 3. Atualiza a lista principal
      await buscarDevolucoes();

    } catch (error: any) {
      console.error('❌ Erro no upload da devolução:', error);

      // 4. Falha: Atualiza o status do item para 'error'
      setPendingDevolucoes(prev =>
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
    setPendingDevolucoes(prev => [newPendingUpload, ...prev]);

    // 3. Inicia o upload "em segundo plano"
    _runUpload(newPendingUpload);
  }

  // --- NOVO: Função para tentar novamente um upload falho ---
  const handleRetryUpload = (item: PendingUpload) => {
    // 1. Reseta o status para 'pending'
    setPendingDevolucoes(prev =>
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
      {/* Mostra o ícone de status */}
      {item.status === 'pending' ? (
        <ActivityIndicator size="small" color="#E67E22" style={{marginRight: 12}} />
      ) : (
        <Ionicons name="warning-outline" size={24} color="#E74C3C" style={{marginRight: 12}} />
      )}
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
          <Ionicons name="refresh" size={24} color="#3498DB" />
        </TouchableOpacity>
      )}
    </View>
  );

  // --- Render Item da Lista (sem alteração) ---
  const renderItemLista = ({ item }: { item: Devolucao }) => (
    <TouchableOpacity
      style={styles.itemContainer}
      onPress={() => router.push(`/devolucoes/${item.id_chamada_devolucao}`)}
    >
      <Ionicons name="document-text-outline" size={32} color="#E67E22" style={{marginRight: 12}} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{t('return')} #{item.id_chamada_devolucao}</Text>
        <Text style={styles.itemDate}>
          {t('limitDate')}: {new Date(item.data_limite).toLocaleDateString('pt-BR')}
        </Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#777" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t("return") || "Devoluções"} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção de Upload (sem alteração) */}
        <View style={styles.tituloLinha}>
          <Ionicons name="add-circle-outline" size={22} color="#333" />
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
            <Text style={styles.dropText}>{t("addFile")}</Text>
          </View>
        </TouchableOpacity>

        {/* Seção da Lista de Devoluções Abertas */}
        <View style={styles.tituloLinha}>
          <Ionicons name="alert-circle-outline" size={22} color="#34495E" />
          <Text style={[styles.titulo, { marginTop: 0 }]}>
            {t("openReturns")}
          </Text>
        </View>

        {/* --- NOVO: Renderiza a lista de pendentes --- */}
        {pendingDevolucoes.length > 0 && (
          <View>
            {pendingDevolucoes.map(renderPendingItem)}
          </View>
        )}

        {/* Lista de devoluções reais */}
        {loadingList ? (
          <ActivityIndicator size="large" color="#E67E22" style={{marginTop: 20}} />
        ) : errorList ? (
          <Text style={styles.errorText}>{errorList}</Text>
        ) : (
          <FlatList
            data={devolucoesAbertas}
            renderItem={renderItemLista}
            keyExtractor={(item) => item.id_chamada_devolucao.toString()}
            scrollEnabled={false}
            ListEmptyComponent={
              pendingDevolucoes.length === 0 ? ( // Só mostra se pendentes tbm for 0
                <Text style={styles.emptyText}>{t('noReturnsOpen')}</Text>
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
                style={[styles.modalBotao, { backgroundColor: "#E53935" }]}
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
  itemContainer: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  // NOVO: Estilo para item pendente
  pendingItem: {
    backgroundColor: '#FFF8E1', // Um amarelo claro
    borderColor: '#FFD54F',
    borderWidth: 1,
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
  },
  itemDate: {
    fontSize: 13,
    color: "#E74C3C",
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