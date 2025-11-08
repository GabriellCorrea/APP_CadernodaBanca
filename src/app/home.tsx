import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { MetaDoDia } from "@/components/MetaDoDia/MetaDoDia";
import { UltimasVendas } from "@/components/UltimasVendas/UltimasVendas";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { useRouter } from "expo-router";
import { useCallback, useEffect, useState } from "react"; // NOVO: Importar useCallback
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type VendaRecenteApi = any;

/**
 * Helper para traduzir erros da API em mensagens amigáveis.
 * (Idealmente, isso ficaria em um arquivo de utils, ex: 'utils/errorUtils.js')
 *
 * @param err O objeto de erro (geralmente do Axios)
 * @param t A função de tradução (i18n)
 * @returns Uma string com a mensagem de erro amigável
 */
const getFriendlyErrorMessage = (err: any, t: (key: string, fallback?: string) => string): string => {
  if (err.code === 'ERR_NETWORK') {
    return t("errorNetwork", "Erro de conexão. Verifique sua internet.");
  }

  if (err.response?.status) {
    const status = err.response.status;
    if (status >= 500) {
      return t("errorServer", "Erro no servidor. Tente novamente mais tarde.");
    }
    if (status === 401 || status === 403) {
      return t("errorAuth", "Você não tem permissão para ver isso.");
    }
    if (status === 404) {
      return t("errorNotFound", "Não encontramos o que você procurava.");
    }
  }

  // Fallback para a mensagem de erro que você já tinha ou uma genérica
  return err.message || t("saleError", "Ocorreu um erro ao carregar os dados.");
};


export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  const [faturamento, setFaturamento] = useState<number>(0);
  const [ultimasVendas, setUltimasVendas] = useState<VendaRecenteApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false); // Estado para o RefreshControl
  const [error, setError] = useState<string | null>(null);

 
  const carregarHomeData = useCallback(async (isRefresh = false) => {
    
    if (!isRefresh) {
      setLoading(true);
    }
    setError(null); // Limpa erros anteriores a cada nova tentativa

    try {
      const data = await apiService.relatorios.home();
      
      

      if (data) {
        setFaturamento(data.faturamento_do_dia || 0);
        console.log("Dados da home recebidos:", data);

        if (Array.isArray(data.ultimas_vendas)) {
          setUltimasVendas(data.ultimas_vendas);
        } else if (typeof data.ultimas_vendas === 'object' && data.ultimas_vendas !== null) {
          setUltimasVendas(Object.values(data.ultimas_vendas));
        } else {
          setUltimasVendas([]);
        }

      } else {
        throw new Error("Formato de resposta inesperado da API.");
      }

    } catch (err: any) {
      console.error("Erro ao buscar dados da home:", err);
      // Usamos o helper para definir uma mensagem amigável
      const friendlyMessage = getFriendlyErrorMessage(err, t);
      setError(friendlyMessage);
      setFaturamento(0);
      setUltimasVendas([]);
    } finally {
      // Só paramos o loading principal se não for um refresh
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [t]); // A dependência 't' garante que a função seja recriada se o idioma mudar

  // useEffect agora chama a função memoizada (useCallback)
  useEffect(() => {
    carregarHomeData(false); // Chama como load inicial
  }, [carregarHomeData]);

  // Função para lidar com o "puxar para atualizar"
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarHomeData(true); // Chama como refresh
    setRefreshing(false);
  }, [carregarHomeData]);

  //Função para o botão "Tentar Novamente"
  const handleRetry = () => {
    carregarHomeData(false); // Chama como um load inicial
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header usuario="Andrea" pagina={t("home")} />

      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollContentContainer}
        //Adiciona o RefreshControl
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF9800"]} // Cor do spinner do refresh
            tintColor={"#FF9800"}
          />
        }
      >
        {/* Lógica de renderização
            Mostra um spinner grande se for o load inicial
        */}
        {loading ? (
          <ActivityIndicator size="large" color="#FF9800" style={styles.loader} />
        ) : error ? (
          // Se der erro, mostra o container de erro com o botão
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>{"Tentar Novamente"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          // Se tudo der certo, mostra o conteúdo
          <>
            <MetaDoDia faturamentoDoDia={faturamento} />

            <TouchableOpacity
              style={styles.fixedRegistrarVendaBtn}
              onPress={() => router.push("/vendas")}
            >
              <View style={styles.buttonContent}>
                <Text style={styles.plusSymbol}>+</Text>
                <Text style={styles.registrarVendaText}>{t("registerSale")}</Text>
              </View>
            </TouchableOpacity>

            
            <UltimasVendas vendasRaw={ultimasVendas} loading={loading || refreshing} />
          </>
        )}

      </ScrollView>

      <View style={styles.bottomNavContainer}>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 160,
    flexGrow: 1, //Garante que o scroll ocupe espaço mesmo com pouco conteúdo
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  fixedRegistrarVendaBtn: {
    position: "relative",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#FF9800",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    marginTop: 20, // Adicionado um espaço
    marginBottom: 20, // Adicionado um espaço
  },
  buttonContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  registrarVendaText: {
    color: "#ffffffff",
    fontSize: 20,
    fontWeight: "bold",
  },
  plusSymbol: {
    color: "#ffffffff",
    fontSize: 36,
    fontWeight: "bold",
    marginRight: 8,
  },
  // Estilo de erro antigo
  errorText: {
    color: '#D32F2F', 
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20, 
  },
  // Estilos para o container de erro e botão
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  retryButton: {
    backgroundColor: '#FF9800',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  }
});