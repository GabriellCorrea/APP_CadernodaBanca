import { Header } from "@/components/header";
import { MetaDoDia } from "@/components/MetaDoDia/MetaDoDia";
import { UltimasVendas } from "@/components/UltimasVendas/UltimasVendas";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
// ATUALIZADO: Importar useFocusEffect
import { useRouter, useFocusEffect } from "expo-router";
// ATUALIZADO: Importar useCallback
import { useCallback, useEffect, useState } from "react";
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
  return err.message || t("saleError", "Ocorreu um erro ao carregar os dados.");
};


export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  const [faturamento, setFaturamento] = useState<number>(0);
  const [ultimasVendas, setUltimasVendas] = useState<VendaRecenteApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const carregarHomeData = useCallback(async (isRefresh = false) => {

    if (!isRefresh) {
      setLoading(true);
    }
    setError(null);

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
      const friendlyMessage = getFriendlyErrorMessage(err, t);
      setError(friendlyMessage);
      setFaturamento(0);
      setUltimasVendas([]);
    } finally {
      if (!isRefresh) {
        setLoading(false);
      }
    }
  }, [t]);

  // --- ATUALIZADO AQUI ---
  // Substituímos useEffect por useFocusEffect
  // Usamos useCallback para evitar que a função seja recriada em cada render
  useFocusEffect(
    useCallback(() => {
      // O 'false' indica que é um carregamento de foco, não um "puxar para atualizar"
      carregarHomeData(false);
    }, [carregarHomeData]) // Depende da função memoizada
  );
  // --- FIM DA ATUALIZAÇÃO ---

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await carregarHomeData(true); // Chama como refresh
    setRefreshing(false);
  }, [carregarHomeData]);

  const handleRetry = () => {
    carregarHomeData(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header usuario="Andrea" pagina={t("home")} />

      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollContentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF9800"]}
            tintColor={"#FF9800"}
          />
        }
      >
        {loading ? (
          <ActivityIndicator size="large" color="#FF9800" style={styles.loader} />
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>{"Tentar Novamente"}</Text>
            </TouchableOpacity>
          </View>
        ) : (
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
    </SafeAreaView>
  );
}

// Estilos permanecem os mesmos...
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
    flexGrow: 1,
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
    marginTop: 20,
    marginBottom: 20,
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
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 20,
  },
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