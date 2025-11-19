import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useData } from "@/contexts/DataContext"; // <--- ADICIONADO
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Tipo para a revista dentro da devolução
type RevistaDevolucao = {
  id_revista: number;
  qtd_a_devolver: number;
  revistas: { // Objeto vindo do JOIN
    nome: string;
    numero_edicao: number;
  }
};

// Tipo para o detalhe da devolução
type DevolucaoDetalhe = {
  id_chamada_devolucao: number;
  data_limite: string;
  status: string;
  revistas_chamadasdevolucao: RevistaDevolucao[];
};

export default function DetalheDevolucao() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Pega o ID da URL

  const [devolucao, setDevolucao] = useState<DevolucaoDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {dataVersion} = useData();

  useEffect(() => {
    
    if (!id || typeof id !== 'string') {
      setError("ID da devolução inválido.");
      setLoading(false);
      return;
    
    }
    
  
    const carregarDetalhes = async () => {
      try {
        setLoading(true);
        setError(null);
        // Usar a API para consultar
        const data = await apiService.devolucoes.consultar(Number(id));
        setDevolucao(data);
      } catch (err: any) {
        console.error("Erro ao carregar detalhes da devolução:", err);
        setError(err.message || "Não foi possível carregar os detalhes.");
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhes();
    
  }, [id, dataVersion]); // Recarrega quando dataVersion mudar  

  const handleConfirmar = async () => {
    if (isConfirming || !id || typeof id !== 'string') return;

    Alert.alert(
      "Confirmar Devolução",
      "Você confirma que esta devolução foi concluída?",
      [
        { text: t('cancel'), style: 'cancel' },
        {
          text: t('confirm'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsConfirming(true);
              // Usar a API para confirmar
              await apiService.devolucoes.confirmar(Number(id));

              Alert.alert(
                t('success'),
                "Devolução confirmada e movida para o histórico.",
                [{ text: t('ok'), onPress: () => router.back() }] // Volta para a lista
              );

            } catch (err: any) {
              console.error("Erro ao confirmar devolução:", err);
              Alert.alert(t('error'), err.message || "Não foi possível confirmar.");
            } finally {
              setIsConfirming(false);
            }
          }
        }
      ]
    );
  };

  const renderItemRevista = ({ item }: { item: RevistaDevolucao }) => (
    <View style={styles.revistaItem}>
      <View style={styles.revistaInfo}>
        <Text style={styles.revistaNome}>
          {item.revistas.nome || 'Revista desconhecida'}
        </Text>
        <Text style={styles.revistaEdicao}>
          {t('edition')}: {item.revistas.numero_edicao || 'N/A'}
        </Text>
      </View>
      <Text style={styles.revistaQtd}>{item.qtd_a_devolver} un.</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#E67E22" style={styles.centered} />;
    }

    if (error) {
      return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
    }

    if (!devolucao) {
      return <Text style={styles.centered}>Devolução não encontrada.</Text>;
    }

    return (
      <>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            {t('return')} #{devolucao.id_chamada_devolucao}
          </Text>
          <Text style={styles.headerSubtitle}>
            {t('limitDate')}: {new Date(devolucao.data_limite).toLocaleDateString('pt-BR')}
          </Text>
          <Text style={styles.headerStatus}>
            Status: <Text style={devolucao.status === 'aberta' ? styles.statusAberta : styles.statusFechada}>
              {devolucao.status}
            </Text>
          </Text>
        </View>

        <Text style={styles.listTitle}>{t('toReturn')}:</Text>
        <FlatList
          data={devolucao.revistas_chamadasdevolucao}
          renderItem={renderItemRevista}
          keyExtractor={(item) => item.id_revista.toString()}
          contentContainerStyle={{ paddingBottom: 150 }} // Espaço para o botão
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma revista nesta devolução.</Text>}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t("returnDetails") || "Detalhe da Devolução"} />

      <View style={styles.container}>
        {renderContent()}
      </View>

      {/* Botão de Confirmação Fixo */}
      {devolucao && devolucao.status === 'aberta' && (
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity
            style={[styles.confirmButton, isConfirming && styles.buttonDisabled]}
            onPress={handleConfirmar}
            disabled={isConfirming}
          >
            {isConfirming ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="checkmark-done-circle-outline" size={24} color="#fff" />
                <Text style={styles.confirmButtonText}>{t('confirmReturn')}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
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
    color: '#E74C3C',
    marginTop: 4,
  },
  headerStatus: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  statusAberta: {
    color: '#E67E22',
    fontWeight: 'bold',
  },
  statusFechada: {
    color: '#27AE60',
    fontWeight: 'bold',
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
    color: '#E67E22',
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
  bottomButtonContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 16,
    backgroundColor: '#F8F8F8', // Fundo para não vazar
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  confirmButton: {
    backgroundColor: '#E53935', // Vermelho
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    elevation: 3,
  },
  confirmButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  buttonDisabled: {
    backgroundColor: '#ccc',
  }
});