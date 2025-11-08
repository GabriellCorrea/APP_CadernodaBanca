import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/lib/supabase";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function HistoricoGestao() {
  const { t } = useLanguage();
  const [ultimasEntregas, setUltimasEntregas] = useState<any[]>([]);
  const [ultimasDevolucoes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Função para buscar chamadas (entregas) do usuário
  const buscarEntregasReais = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Obter o usuário logado
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log('❌ Usuário não autenticado');
        setUltimasEntregas([]);
        return;
      }

      console.log('🔍 Buscando chamadas do usuário:', user.id);
      
      // Buscar chamadas do usuário logado
  // listarPorUsuario agora já faz retry em 5xx internamente
  const chamadas = await apiService.devolucoes.listarPorUsuario();

  console.log('📦 Chamadas encontradas:', chamadas.length);

      // Mapear para o formato esperado pela interface
      const entregasFormatadas = chamadas.map((chamada: any, index: number) => ({
        id: chamada.id || index + 1,
        titulo: chamada.nome_arquivo || chamada.titulo || `Chamada ${index + 1}`,
        data: chamada.data_criacao 
          ? new Date(chamada.data_criacao).toLocaleDateString('pt-BR', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            })
          : new Date().toLocaleDateString('pt-BR', {
              day: 'numeric', 
              month: 'long',
              year: 'numeric'
            }),
        imagem: chamada.imagem || "https://m.media-amazon.com/images/I/91H8KkNZdpL._AC_UF1000,1000_QL80_.jpg", // imagem padrão para PDFs
      }));

      setUltimasEntregas(entregasFormatadas.slice(0, 4)); // Mostrar apenas as 4 mais recentes
      
    } catch (error) {
      console.error('❌ Erro ao buscar entregas:', error);
      // Se for erro HTTP com status 500, mostramos mensagem amigável
      const status = (error as any)?.response?.status
      if (status === 500) {
        setError('Erro interno no servidor ao buscar entregas. Tente novamente em alguns instantes.')
      } else {
        setError('Erro ao buscar entregas. Verifique sua conexão ou tente novamente.')
      }
      // Em caso de erro, manter array vazio
      setUltimasEntregas([]);
    } finally {
      setLoading(false);
    }
  };

  // Buscar dados quando o componente montar
  useEffect(() => {
    buscarEntregasReais();
  }, []);

  const renderItem = (item: any) => (
    <TouchableOpacity key={item.id} style={styles.itemContainer} activeOpacity={0.7}>
      <Image source={{ uri: item.imagem }} style={styles.itemImage} />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle}>{item.titulo}</Text>
        <Text style={styles.itemDate}>{item.data}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      <Header usuario="Andrea" pagina={t("managementHistory")} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Seção Últimas Entregas Registradas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="document-text-outline" size={22} color="#34495E" />
            <Text style={styles.sectionTitle}>{t("lastDeliveries")}</Text>
          </View>
          
          <View style={styles.grid}>
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#3498DB" />
                <Text style={styles.loadingText}>{t("loadingDeliveries")}</Text>
              </View>
            ) : error ? (
              <View style={styles.errorState}>
                <Text style={styles.errorText}>{error}</Text>
                <TouchableOpacity style={styles.retryButton} onPress={buscarEntregasReais}>
                  <Text style={styles.retryButtonText}>Tentar novamente</Text>
                </TouchableOpacity>
              </View>
            ) : ultimasEntregas.length > 0 ? (
              ultimasEntregas.map(renderItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="document-text-outline" size={48} color="#BDC3C7" />
                <Text style={styles.emptyText}>Nenhuma entrega registrada ainda</Text>
              </View>
            )}
          </View>
        </View>

        {/* Seção Últimas Devoluções Registradas */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="return-up-back-outline" size={22} color="#34495E" />
            <Text style={styles.sectionTitle}>{t("lastReturns")}</Text>
          </View>
          
          <View style={styles.grid}>
            {ultimasDevolucoes.length > 0 ? (
              ultimasDevolucoes.map(renderItem)
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="return-up-back-outline" size={48} color="#BDC3C7" />
                <Text style={styles.emptyText}>Nenhuma devolução registrada ainda</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>

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
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#34495E",
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
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
  },
  itemImage: {
    width: "100%",
    height: 120,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: "cover",
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2C3E50",
    marginBottom: 4,
    lineHeight: 18,
  },
  itemDate: {
    fontSize: 12,
    color: "#7F8C8D",
    fontWeight: "400",
  },
  emptyState: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 12,
    textAlign: "center",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    color: "#7F8C8D",
    marginTop: 12,
    textAlign: "center",
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
  },
  errorText: {
    fontSize: 14,
    color: '#E74C3C',
    marginBottom: 12,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#3498DB',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '600',
  },
});
