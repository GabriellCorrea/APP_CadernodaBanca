import { BottomNav } from "@/components/barra_navegacao";
import { CardRevista } from "@/components/card_revista";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Feather, Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker"; // Importado
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Modal, // Importado
  Alert, // Importado
  KeyboardAvoidingView, // Importado
  Platform, // Importado
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Estoque() {
  const { t } = useLanguage();
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");
  const [produtos, setProdutos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Novos Estados para o Modal ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null);
  const [novoCodigoBarras, setNovoCodigoBarras] = useState("");
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [isSavingCodigo, setIsSavingCodigo] = useState(false);
  // --- Fim Novos Estados ---

  const filtros = ["Todos", "À mostra", "Em estoque"];

  useEffect(() => {
    carregarRevistas();
  }, []);

  async function carregarRevistas() {
    try {
      setLoading(true);
      // 1. Alterado para o novo endpoint da api.ts
      const revistas = await apiService.revistas.estoque();
      setProdutos(revistas);
    } catch (error) {
      console.error("❌ Erro ao buscar revistas:", error);
      Alert.alert(t("error"), "Não foi possível carregar o estoque.");
    } finally {
      setLoading(false);
    }
  }

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case "Todos": return t('all');
      case "À mostra": return t('onDisplay');
      case "Em estoque": return t('inStock');
      default: return filter;
    }
  };

  // Lógica de contagem baseada nos dados do frontend (igual ao anterior)
  const contagemFiltros: Record<string, number> = {
    Todos: produtos.length,
    "À mostra": produtos.filter((p) => (p.qtd_estoque || 0) <= 10).length,
    "Em estoque": produtos.filter((p) => (p.qtd_estoque || 0) > 0).length,
  };

  // Lógica de filtro (igual ao anterior)
  const produtosFiltrados = produtos
    .filter((p) => {
      if (filtro === "Todos") return true;
      if (filtro === "À mostra") return (p.qtd_estoque || 0) <= 10;
      if (filtro === "Em estoque") return (p.qtd_estoque || 0) > 0;
      return true;
    })
    .filter((p) =>
      (p.titulo || p.nome || "")
        .toLowerCase()
        .includes(busca.toLowerCase())
    );

  // --- Novas Funções para o Modal ---

  const handleCardPress = (produto: any) => {
    setProdutoSelecionado(produto);
    setNovoCodigoBarras(produto.codigo_barras || ""); // Preenche o input
    setIsModalVisible(true);
  };

  const handleCloseModal = () => {
    setIsModalVisible(false);
    setProdutoSelecionado(null);
    setNovoCodigoBarras("");
    setIsUploadingFoto(false);
    setIsSavingCodigo(false);
  };

  const handleAdicionarFoto = async () => {
    if (isUploadingFoto) return;

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "image/*", // Apenas imagens
        copyToCacheDirectory: true,
      });

      if (result.canceled) return;

      const file = (result as any).assets?.[0] ?? result;
      if (!file || !file.uri) return;

      setIsUploadingFoto(true);

      // Chama o novo endpoint da api.ts
      // Assumindo que o produto tem 'id_revista' como no app antigo
      await apiService.revistas.cadastrarFoto(produtoSelecionado.id_revista, file);

      Alert.alert(t("success"), "Foto adicionada com sucesso!");

      // Atualiza o estado local para refletir a mudança
      const novaImagemUri = file.uri;
      setProdutoSelecionado((prev: any) => ({ ...prev, imagem: { uri: novaImagemUri } }));
      setProdutos((prevProdutos) =>
        prevProdutos.map((p) =>
          p.id_revista === produtoSelecionado.id_revista
            ? { ...p, imagem: { uri: novaImagemUri } }
            : p
        )
      );

      handleCloseModal(); // Fecha o modal

    } catch (err) {
      console.error("Erro ao enviar foto:", err);
      Alert.alert(t("error"), "Não foi possível enviar a foto.");
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const handleAdicionarCodigo = async () => {
    if (isSavingCodigo || !novoCodigoBarras || !produtoSelecionado) return;

    if (novoCodigoBarras === produtoSelecionado.codigo_barras) {
      Alert.alert("Aviso", "O código de barras é o mesmo.");
      return;
    }

    try {
      setIsSavingCodigo(true);

      // Chama o novo endpoint da api.ts
      const dados = {
        nome: produtoSelecionado.nome,
        numero_edicao: produtoSelecionado.numero_edicao, // API exige este campo
        codigo_barras: novoCodigoBarras.trim(),
      };

      if (!dados.nome || !dados.numero_edicao) {
        Alert.alert(t("error"), "Dados da revista incompletos (nome ou edição). Não é possível salvar o código.");
        setIsSavingCodigo(false);
        return;
      }

      await apiService.revistas.cadastrarCodigo(dados);
      Alert.alert(t("success"), "Código de barras salvo com sucesso!");

      // Atualiza o estado local
      const novoCodigo = dados.codigo_barras;
      setProdutoSelecionado((prev: any) => ({ ...prev, codigo_barras: novoCodigo }));
      setProdutos((prevProdutos) =>
        prevProdutos.map((p) =>
          p.id_revista === produtoSelecionado.id_revista
            ? { ...p, codigo_barras: novoCodigo }
            : p
        )
      );

      handleCloseModal(); // Fecha o modal

    } catch (err) {
      console.error("Erro ao salvar código:", err);
      Alert.alert(t("error"), "Não foi possível salvar o código de barras.");
    } finally {
      setIsSavingCodigo(false);
    }
  };
  // --- Fim Novas Funções ---

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <Header usuario="Andrea" pagina={t('stock')} />

      {/* Conteúdo */}
      <View style={styles.container}>
        {/* Busca */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={t('searchMagazine')}
            placeholderTextColor="#666"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* Título Filtros */}
        <View style={styles.filtrosTitulo}>
          <Feather name="filter" size={16} color="#1E2A38" />
          <Text style={styles.filtrosTexto}>{t('filters')}</Text>
        </View>

        {/* Botões de Filtro */}
        <View style={styles.filtros}>
          {filtros.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroButton, filtro === f && styles.filtroAtivo]}
              onPress={() => setFiltro(f)}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtro === f && { color: "#34495E", fontWeight: "bold" },
                ]}
              >
                {getFilterLabel(f)} ({contagemFiltros[f]})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de produtos */}
        <ScrollView
          contentContainerStyle={styles.produtos}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={{ alignItems: "center", marginTop: 30 }}>
              <ActivityIndicator size="large" color="#E67E22" />
              <Text style={{ marginTop: 10, color: "#555" }}>
                {t('loadingMagazines')}
              </Text>
            </View>
          )}

          {!loading && produtosFiltrados.length === 0 && (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
              {t('noMagazineFound')}
            </Text>
          )}

          {!loading &&
            produtosFiltrados.map((p) => (
            <CardRevista
              key={p.id_revista}
              // A prop 'imagem' agora vem da nova API (pode ser null)
              // O CardRevista atualizado lida com o placeholder
              imagem={p.imagem}
              titulo={p.nome || "Sem título"}
              preco={p.preco_liquido || 0}
              vendas={p.vendas || 0}
              estoque={p.qtd_estoque || 0}
              // Adiciona o onPress
              onPress={() => handleCardPress(p)}
            />
            ))}
        </ScrollView>
      </View>

      {/* Barra fixa no rodapé */}
      <View style={styles.bottomNavContainer}>
        <BottomNav />
      </View>

      {/* --- Modal de Edição --- */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={modalStyles.modalOverlay}
        >
          <View style={modalStyles.modalContent}>
            {produtoSelecionado && (
              <>
                <Text style={modalStyles.modalTitle}>{produtoSelecionado.nome}</Text>
                <Text style={modalStyles.modalSubtitle}>Edição: {produtoSelecionado.numero_edicao || 'N/A'}</Text>

                {/* Ação: Adicionar Foto */}
                {/* Mostra o botão apenas se NÃO TIVER imagem */}
                {!produtoSelecionado.imagem && (
                  <TouchableOpacity
                    style={modalStyles.actionButton}
                    onPress={handleAdicionarFoto}
                    disabled={isUploadingFoto}
                  >
                    {isUploadingFoto
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={modalStyles.actionButtonText}>Adicionar Foto</Text>
                    }
                  </TouchableOpacity>
                )}
                {/* Informa se já tem foto */}
                {produtoSelecionado.imagem && (
                   <Text style={modalStyles.infoText}>✅ Produto já possui foto.</Text>
                )}

                {/* Ação: Adicionar Cód. Barras */}
                <Text style={modalStyles.inputLabel}>Código de Barras:</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder="Digite ou escaneie o código"
                  value={novoCodigoBarras}
                  onChangeText={setNovoCodigoBarras}
                  keyboardType="numeric"
                  editable={!isSavingCodigo} // Desativa input ao salvar
                />

                {/* Mostra o botão de salvar se o código for editável (ou novo) */}
                {(!produtoSelecionado.codigo_barras || produtoSelecionado.codigo_barras !== novoCodigoBarras) && (
                  <TouchableOpacity
                    style={[modalStyles.actionButton, {backgroundColor: '#27ae60'} ]} // Botão verde para salvar
                    onPress={handleAdicionarCodigo}
                    disabled={isSavingCodigo || !novoCodigoBarras}
                  >
                    {isSavingCodigo
                      ? <ActivityIndicator color="#fff" />
                      : <Text style={modalStyles.actionButtonText}>Salvar Código</Text>
                    }
                  </TouchableOpacity>
                )}
                {/* Informa se o código já está salvo e inalterado */}
                {produtoSelecionado.codigo_barras && produtoSelecionado.codigo_barras === novoCodigoBarras && (
                  <Text style={modalStyles.infoText}>✅ Código de barras já cadastrado.</Text>
                )}


                {/* Botão de Fechar */}
                <TouchableOpacity
                  style={[modalStyles.actionButton, modalStyles.closeButton]}
                  onPress={handleCloseModal}
                >
                  <Text style={[modalStyles.actionButtonText, modalStyles.closeButtonText]}>Fechar</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* --- Fim do Modal --- */}

    </SafeAreaView>
  );
}

// Estilos originais (sem alterações)
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8",
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    marginBottom: 20,
    height: 42,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: "#434343",
  },
  filtrosTitulo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filtrosTexto: {
    fontSize: 14,
    color: "#34495E",
    marginLeft: 6,
  },
  filtros: {
    flexDirection: "row",
    marginBottom: 20,
  },
  filtroButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 8,
  },
  filtroAtivo: {
    backgroundColor: "rgba(230, 126, 34, 0.5)",
  },
  filtroTexto: {
    color: "#34495E",
  },
  produtos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 120,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});

// --- Novos Estilos para o Modal ---
const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: '#333',
    marginTop: 15,
    marginBottom: 5,
    width: '100%',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: '#E67E22',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    width: '100%',
    marginTop: 10,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeButton: {
    backgroundColor: '#7f8c8d',
    marginTop: 15,
  },
  closeButtonText: {
    color: 'white',
  },
  infoText: {
    color: 'green',
    fontSize: 14,
    marginTop: 10,
  }
});