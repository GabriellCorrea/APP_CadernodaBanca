import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Ionicons, Feather } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  KeyboardAvoidingView,
  Platform,
  Image 
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Tipo para a revista dentro da ENTRADA
type RevistaEntrada = {
  id_revista: number;
  qtd_entregue: number;
  revistas: {
    nome: string;
    numero_edicao: number;
    url_revista?: string; // <--- Adicionado para exibir se vier do backend
    codigo_barras?: string; // <--- Adicionado
  }
};

type EntradaDetalhe = {
  id_documento_entrega: number;
  data_entrega: string;
  revistas_documentos_entrega: RevistaEntrada[];
};

export default function DetalheEntrada() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useLocalSearchParams();

  const [entrada, setEntrada] = useState<EntradaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- NOVOS ESTADOS (Copiados do Estoque) ---
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<any>(null); // Objeto temporário para edição
  const [novoCodigoBarras, setNovoCodigoBarras] = useState("");
  const [isUploadingFoto, setIsUploadingFoto] = useState(false);
  const [isSavingCodigo, setIsSavingCodigo] = useState(false);
  const [scannerVisivel, setScannerVisivel] = useState(false);
  const [permissao, requisitarPermissao] = useCameraPermissions();

  // Função de carregamento
  const carregarDetalhes = async () => {
    if (!id || typeof id !== 'string') return;
    try {
      setLoading(true);
      setError(null);
      const data = await apiService.entregas.consultar(Number(id));
      setEntrada(data);
    } catch (err: any) {
      console.error("Erro ao carregar detalhes da entrada:", err);
      setError(err.message || "Não foi possível carregar os detalhes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError("ID da entrada inválido.");
      setLoading(false);
      return;
    }
    carregarDetalhes();
  }, [id]);

  // --- FUNÇÕES DO MODAL (Adaptadas do Estoque) ---

  const handleItemPress = (item: RevistaEntrada) => {
    // Prepara o objeto para o modal
    const produtoAdaptado = {
      id_revista: item.id_revista,
      nome: item.revistas.nome,
      numero_edicao: item.revistas.numero_edicao,
      codigo_barras: item.revistas.codigo_barras || "",
      // Tenta montar a imagem se existir URL
      imagem: item.revistas.url_revista ? { uri: item.revistas.url_revista } : null
    };

    setProdutoSelecionado(produtoAdaptado);
    setNovoCodigoBarras(produtoAdaptado.codigo_barras || "");
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
    if (isUploadingFoto || !produtoSelecionado) return;

    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();
      if (!permission.granted) {
        Alert.alert("Permissão Negada", "Precisamos da câmera para tirar a foto.");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 0.7,
        aspect: [1, 1],
      });

      if (result.canceled) return;
      const imageAsset = result.assets?.[0];
      if (!imageAsset || !imageAsset.uri) return;

      const file = {
        uri: imageAsset.uri,
        name: imageAsset.fileName || `foto_${Date.now()}.jpg`,
        mimeType: imageAsset.mimeType || "image/jpeg",
        type: imageAsset.mimeType || "image/jpeg",
      };

      setIsUploadingFoto(true);
      await apiService.revistas.cadastrarFoto(produtoSelecionado.id_revista, file);

      Alert.alert(t("success"), "Foto adicionada! Recarregando...");
      handleCloseModal();
      carregarDetalhes(); // Recarrega a lista para atualizar a foto

    } catch (err) {
      console.error("Erro ao enviar foto:", err);
      Alert.alert(t("error"), "Não foi possível enviar a foto.");
    } finally {
      setIsUploadingFoto(false);
    }
  };

  const handleAdicionarCodigo = async () => {
    if (isSavingCodigo || !novoCodigoBarras || !produtoSelecionado) return;

    try {
      setIsSavingCodigo(true);
      const dados = {
        nome: String(produtoSelecionado.nome),
        numero_edicao: Number(produtoSelecionado.numero_edicao),
        codigo_barras: String(novoCodigoBarras.trim()),
      };

      await apiService.revistas.cadastrarCodigo(dados);

      Alert.alert(t("success"), "Código de barras salvo!");
      handleCloseModal();
      carregarDetalhes(); // Recarrega para atualizar dados

    } catch (err) {
      console.error("Erro ao salvar código:", err);
      Alert.alert(t("error"), "Falha ao salvar código.");
    } finally {
      setIsSavingCodigo(false);
    }
  };

  const handleBarCodeScanned = ({ type, data }: { type: string; data: string }) => {
    if (data && scannerVisivel) {
      setScannerVisivel(false);
      setNovoCodigoBarras(data);
      Alert.alert("Código Escaneado", `Código: ${data}`);
    }
  };

  // --- RENDERIZADORES ---

  const renderItemRevista = ({ item }: { item: RevistaEntrada }) => (
    <TouchableOpacity
      style={styles.revistaItem}
      onPress={() => handleItemPress(item)} // <--- Adicionado evento de clique
      activeOpacity={0.7}
    >
      <View style={styles.revistaInfo}>
        <Text style={styles.revistaNome}>
          {item.revistas.nome || 'Revista desconhecida'}
        </Text>
        <Text style={styles.revistaEdicao}>
          {t('edition')}: {item.revistas.numero_edicao || 'N/A'}
        </Text>
        {/* Indicador visual se tem código ou foto faltante (opcional) */}
        {(!item.revistas.codigo_barras || !item.revistas.url_revista) && (
            <Text style={{fontSize: 10, color: '#E67E22', marginTop: 2}}>
               Toque para completar cadastro
            </Text>
        )}
      </View>
      <Text style={styles.revistaQtd}>{item.qtd_entregue} un.</Text>
      <Ionicons name="create-outline" size={20} color="#999" style={{marginLeft: 10}}/>
    </TouchableOpacity>
  );

  const renderContent = () => {
    if (loading) return <ActivityIndicator size="large" color="#E67E22" style={styles.centered} />;
    if (error) return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
    if (!entrada) return <Text style={styles.centered}>Entrada não encontrada.</Text>;

    return (
      <>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {t('delivery')} #{entrada.id_documento_entrega}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('deliveryDate')}: {new Date(entrada.data_entrega).toLocaleDateString('pt-BR')}
          </Text>
        </View>

        <Text style={styles.listTitle}>{t('recievedMagazines')}:</Text>
        <FlatList
          data={entrada.revistas_documentos_entrega}
          renderItem={renderItemRevista}
          keyExtractor={(item) => item.id_revista.toString()}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListEmptyComponent={<Text style={styles.emptyText}>{t('noMagazinesReceived')}</Text>}
        />
      </>
    );
  };

  // Se não tiver permissão de câmera ainda
  if (permissao && !permissao.granted) {
     // Pode renderizar um botão para pedir permissão ou apenas continuar (o modal pedirá novamente)
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t("deliveryDetails") || "Detalhe da Entrada"} />

      <View style={styles.container}>
        {renderContent()}
      </View>

      {/* --- MODAL DE EDIÇÃO (Igual ao Estoque) --- */}
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
                <Text style={modalStyles.modalTitle}>{produtoSelecionado.nome}</Text>
                <Text style={modalStyles.modalSubtitle}>
                  {t('edition')}: {produtoSelecionado.numero_edicao || "N/A"}
                </Text>

                {/* Exibir Imagem se existir */}
                {produtoSelecionado.imagem && (
                  <Image
                    source={produtoSelecionado.imagem}
                    style={{
                      width: 120,
                      height: 160,
                      resizeMode: "cover",
                      borderRadius: 8,
                      marginBottom: 15,
                      alignSelf: "center"
                    }}
                  />
                )}

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
                      <Text style={modalStyles.actionButtonText}>{t('addPhoto')}</Text>
                    )}
                  </TouchableOpacity>
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
                  style={[modalStyles.actionButton, { backgroundColor: "#2980b9" }]}
                  onPress={() => setScannerVisivel(true)}
                >
                  <Text style={modalStyles.actionButtonText}>{t('scanCode')}</Text>
                </TouchableOpacity>

                {/* Botão Salvar Código */}
                <TouchableOpacity
                  style={[modalStyles.actionButton, { backgroundColor: "#27ae60" }]}
                  onPress={handleAdicionarCodigo}
                  disabled={isSavingCodigo || !novoCodigoBarras}
                >
                  {isSavingCodigo ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={modalStyles.actionButtonText}>{t('saveCode')}</Text>
                  )}
                </TouchableOpacity>

                {/* Botão Fechar */}
                <TouchableOpacity
                  style={[modalStyles.actionButton, modalStyles.closeButton]}
                  onPress={handleCloseModal}
                >
                  <Text style={[modalStyles.actionButtonText, modalStyles.closeButtonText]}>
                    {t('closeModal')}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* --- MODAL DO SCANNER --- */}
      <Modal
        visible={scannerVisivel}
        onRequestClose={() => setScannerVisivel(false)}
        animationType="slide"
      >
        <View style={{ flex: 1, backgroundColor: "black" }}>
          <CameraView
            style={StyleSheet.absoluteFillObject}
            onBarcodeScanned={handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["ean13", "ean8", "qr", "upc_a", "upc_e", "code128"],
            }}
          />
          <View style={scannerStyles.overlay}>
            <View style={scannerStyles.scanBox} />
            <Text style={scannerStyles.overlayText}>{t('targetCode')}</Text>
          </View>
          <TouchableOpacity
            style={scannerStyles.closeButton}
            onPress={() => setScannerVisivel(false)}
          >
            <Ionicons name="close-circle" size={40} color="white" />
          </TouchableOpacity>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

// Estilos principais
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    color: 'red',
  },
  headerInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34495E',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#27AE60',
    marginTop: 4,
    fontWeight: '600',
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 10,
  },
  revistaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  revistaInfo: {
    flex: 1,
  },
  revistaNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  revistaEdicao: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  revistaQtd: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});

// Estilos do Modal (Copiados do Estoque)
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
});

// Estilos do Scanner
const scannerStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "transparent",
  },
  scanBox: {
    width: "70%",
    height: 200,
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
    top: Platform.OS === "ios" ? 60 : 30,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 20,
  },
});