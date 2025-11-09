import { BottomNav } from "@/components/barra_navegacao";
import { CardRevista } from "@/components/card_revista";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Feather, Ionicons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker"; // Importado
import { useEffect, useState } from "react";
import {
  ActivityIndicator, // Importado
  Alert, // Importado
  Button,
  KeyboardAvoidingView,
  Modal, // Importado
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
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
  const [scannerVisivel, setScannerVisivel] = useState(false);
  const [permissao, requisitarPermissao] = useCameraPermissions();
  // --- Fim Novos Estados ---

  const filtros = ["Todos", "À mostra", "Em estoque"];



  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (data && scannerVisivel) {
      setScannerVisivel(false);
      setNovoCodigoBarras(data);
      Alert.alert("Código Escaneado", `Código: ${data}`);
    }
  };



  useEffect(() => {
    carregarRevistas();
  }, []);

  async function carregarRevistas() {
    try {
      setLoading(true);
      // 1. Alterado para o novo endpoint da api.ts 
      const revistas = await apiService.revistas.estoque();
      const revistasFormatadas = revistas.map(r => {
        if (r.url_revista) {
          console.log("URL da revista:", r.url_revista);
        }
        if (r.url_revista && typeof r.url_revista === 'string') {
          const separator = r.url_revista.includes('?') ? '&' : '?';
          const cacheBustedUrl = `${r.url_revista}${separator}timestamp=${new Date().getTime()}`;
          return { ...r, imagem: { uri: cacheBustedUrl } };
        }
        return r;
      });

      setProdutos(revistasFormatadas);
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
      // 1. Pedir permissão para usar a câmera
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert(
          t("permissionDenied"), // Adicionar esta chave ao seu i18n
          t("cameraPermissionRequired") // Adicionar esta chave ao seu i18n
        );
        return;
      }

      // 2. Abrir a câmera
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true, // Permite ao usuário confirmar e cortar a foto
        quality: 0.7, // Comprime um pouco a imagem
        aspect: [1, 1], // Opcional: Força um corte quadrado
      });

      if (result.canceled) return;

      // 3. Pegar o asset da imagem
      const imageAsset = result.assets?.[0];
      if (!imageAsset || !imageAsset.uri) return;

      // 4. Adaptar o objeto 'file' para a API
      // A API espera um objeto com uri, name, e mimeType
      const file = {
        uri: imageAsset.uri,
        name:
          imageAsset.fileName ||
          `foto_${Date.now()}.${imageAsset.uri.split(".").pop() || "jpg"}`,
        mimeType: imageAsset.mimeType || "image/jpeg", // Usar mimeType se disponível
        type: imageAsset.mimeType || "image/jpeg", // 'type' é necessário para FormData
      };


      setIsUploadingFoto(true);

      // 5. Enviar o 'file' adaptado para a API
      await apiService.revistas.cadastrarFoto(produtoSelecionado.id_revista, file);

      Alert.alert(t("success"), "Foto adicionada com sucesso!");

      // 6. Atualizar estado local (mesma lógica de antes)
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
        nome: String(produtoSelecionado.nome),
        numero_edicao: Number(produtoSelecionado.numero_edicao), // API exige este campo
        codigo_barras: String(novoCodigoBarras.trim()),
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

  if (!permissao) {
    // Permissões ainda carregando
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <ActivityIndicator size="large" color="#E67E22" />
        </View>
      </SafeAreaView>
    );
  }

  if (!permissao.granted) {
    // Permissões não concedidas
    return (
      <SafeAreaView
        style={[
          styles.safeArea,
          { justifyContent: "center", alignItems: "center", padding: 20 },
        ]}
      >
        <Header usuario="Andrea" pagina={t('stock')} />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ textAlign: "center", marginBottom: 20, fontSize: 16 }}>
            Precisamos da sua permissão para usar a câmera e escanear códigos.
          </Text>
          <Button onPress={requisitarPermissao} title="Conceder Permissão" />
        </View>
        <View style={styles.bottomNavContainer}>
          <BottomNav />
        </View>
      </SafeAreaView>
    );
  }
  // --- Fim da Lógica de Permissão ---

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <Header usuario="Andrea" pagina={t("stock")} />

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
            placeholder={t("searchMagazine")}
            placeholderTextColor="#666"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* Título Filtros */}
        <View style={styles.filtrosTitulo}>
          <Feather name="filter" size={16} color="#1E2A38" />
          <Text style={styles.filtrosTexto}>{t("filters")}</Text>
        </View>

        {/* Botões de Filtro */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate="fast"
          snapToAlignment="start"
          style={styles.filtros}
        >
          {filtros.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroButton, filtro === f && styles.filtroAtivo]}
              onPress={() => setFiltro(f)}
            >
              <Text
                style={[
                  styles.filtrosTexto,
                  filtro === f && { color: "#34495E", fontWeight: "bold" },
                ]}
              >
                {getFilterLabel(f)} ({contagemFiltros[f]})
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Lista de produtos */}
        <ScrollView
          style={{ flex: 1 }}
          contentContainerStyle={styles.produtos}
          showsVerticalScrollIndicator={false}
        >
          {loading && (
            <View style={{ alignItems: "center", marginTop: 30, flex: 1, width: '100%' }}>
              <ActivityIndicator size="large" color="#E67E22" />
              <Text style={{ marginTop: 10, color: "#555" }}>
                {t("loadingMagazines")}
              </Text>
            </View>
          )}

          {!loading && produtosFiltrados.length === 0 && (
            <Text style={{ textAlign: "center", marginTop: 20, color: "#777" }}>
              {t("noMagazineFound")}
            </Text>
          )}

          {!loading &&
            produtosFiltrados.map((p) => (
              <CardRevista
                key={p.id_revista}
                imagem={p.imagem}
                titulo={p.nome || "Sem título"}
                preco={p.preco_capa || 0}
                vendas={p.vendas || 0}
                estoque={p.qtd_estoque || 0}
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
        presentationStyle="overFullScreen"
        statusBarTranslucent={true}
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
                <Text style={modalStyles.modalTitle}>
                  {produtoSelecionado.nome}
                </Text>
                <Text style={modalStyles.modalSubtitle}>
                  {t('edition')}: {produtoSelecionado.numero_edicao || "N/A"}
                </Text>

                {/* Ação: Adicionar Foto */}
                {!produtoSelecionado.imagem && (
                  <TouchableOpacity
                    style={modalStyles.actionButton}
                    onPress={handleAdicionarFoto}
                    disabled={isUploadingFoto}
                  >
                    {isUploadingFoto ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <Text style={modalStyles.actionButtonText}>
                        {t('addPhoto')}
                      </Text>
                    )}
                  </TouchableOpacity>
                )}
                {produtoSelecionado.imagem && (
                  <Text style={modalStyles.infoText}>
                    {t('photoExists')}
                  </Text>
                )}

                {/* Ação: Adicionar Cód. Barras */}
                <Text style={modalStyles.inputLabel}>{t('barCode')}:</Text>
                <TextInput
                  style={modalStyles.input}
                  placeholder={t("typeCode")}
                  value={novoCodigoBarras}
                  onChangeText={setNovoCodigoBarras}
                  keyboardType="numeric"
                  editable={!isSavingCodigo}
                />
                <TouchableOpacity
                  style={[
                    modalStyles.actionButton,
                    { backgroundColor: "#2980b9" },
                  ]}
                  onPress={() => setScannerVisivel(true)}
                >
                  <Text style={modalStyles.actionButtonText}>
                    {t('scanCode')}
                  </Text>
                </TouchableOpacity>

                {/* Botão Salvar Código */}
                {(!produtoSelecionado.codigo_barras ||
                  produtoSelecionado.codigo_barras !== novoCodigoBarras) && (
                    <TouchableOpacity
                      style={[
                        modalStyles.actionButton,
                        { backgroundColor: "#27ae60" },
                      ]}
                      onPress={handleAdicionarCodigo}
                      disabled={isSavingCodigo || !novoCodigoBarras}
                    >
                      {isSavingCodigo ? (
                        <ActivityIndicator color="#fff" />
                      ) : (
                        <Text style={modalStyles.actionButtonText}>
                          {t('saveCode')}
                        </Text>
                      )}
                    </TouchableOpacity>
                  )}
                {produtoSelecionado.codigo_barras &&
                  produtoSelecionado.codigo_barras === novoCodigoBarras && (
                    <Text style={modalStyles.infoText}>
                      {t('barCodeExists')}
                    </Text>
                  )}

                {/* Botão de Fechar */}
                <TouchableOpacity
                  style={[modalStyles.actionButton, modalStyles.closeButton]}
                  onPress={handleCloseModal}
                >
                  <Text
                    style={[
                      modalStyles.actionButtonText,
                      modalStyles.closeButtonText,
                    ]}
                  >
                    {t('closeModal')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>
      {/* --- Fim do Modal de Edição --- */}

      {/* --- 4. Modal do Scanner (Corrigido) --- */}
      <Modal
        visible={scannerVisivel}
        onRequestClose={() => setScannerVisivel(false)}
        animationType="slide"
      >
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <CameraView
            style={StyleSheet.absoluteFillObject} // Preenche a tela
            onBarcodeScanned={handleBarCodeScanned} // Prop para escanear
            barcodeScannerSettings={{
              // Otimização
              barcodeTypes: [
                "ean13",
                "ean8",
                "qr",
                "upc_a",
                "upc_e",
                "code128",
              ],
            }}
          />

          {/* Overlay de "mira" (Ajuda visual) */}
          <View style={scannerStyles.overlay}>
            <View style={scannerStyles.scanBox} />
            <Text style={scannerStyles.overlayText}>
              {t('targetCode')}
            </Text>
          </View>

          {/* Botão de fechar sobreposto */}
          <TouchableOpacity
            style={scannerStyles.closeButton}
            onPress={() => setScannerVisivel(false)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>
      {/* --- Fim do Modal do Scanner --- */}
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
    maxHeight: 50,
    marginBottom: 20,
  },
  filtroButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 8,
    height: 35,
    justifyContent: 'center'
  },
  filtroAtivo: {
    backgroundColor: "rgba(230, 126, 34, 0.5)",
  },
  // 'filtroTexto' (duplicado) removido, já existe acima
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

// Estilos para o Modal de Edição
const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 5,
  },
  modalSubtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    color: "#333",
    marginTop: 15,
    marginBottom: 5,
    width: "100%",
  },
  input: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
  },
  actionButton: {
    backgroundColor: "#E67E22",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    width: "100%",
    marginTop: 10,
  },
  actionButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  closeButton: {
    backgroundColor: "#7f8c8d",
    marginTop: 15,
  },
  closeButtonText: {
    color: "white",
  },
  infoText: {
    color: "green",
    fontSize: 14,
    marginTop: 10,
  },
});

// --- 5. Novos Estilos para o Modal do Scanner ---
const scannerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  scanBox: {
    width: "70%",
    height: 200, // Altura da "mira"
    borderColor: "white",
    borderWidth: 2,
    borderRadius: 10,
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  overlayText: {
    color: "white",
    fontSize: 16,
    marginTop: 20,
    fontWeight: "bold",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 5,
  },
  closeButton: {
    position: "absolute",
    top: Platform.OS === "ios" ? 60 : 30, // Ajuste para safe area
    right: 20,
    zIndex: 10,
    // Adiciona um fundo para melhor visibilidade
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
});