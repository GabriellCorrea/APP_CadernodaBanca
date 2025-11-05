import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { UltimasVendas } from "@/components/UltimasVendas/UltimasVendas";
import { MetaDoDia } from "@/components/MetaDoDia/MetaDoDia";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useEffect, useState } from "react";
import { apiService } from "@/services/api";

type VendaRecenteApi = any;

export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();

  const [faturamento, setFaturamento] = useState<number>(0);
  const [ultimasVendas, setUltimasVendas] = useState<VendaRecenteApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function carregarHomeData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Chama o novo endpoint unificado
        // 'data' agora é a resposta direta, pois apiService.relatorios.home() já extrai res.data.data
        const data = await apiService.relatorios.home();

        // 2. Acessa o objeto 'data' (que é a própria resposta)
        if (data) {
          // 3. Atualiza os estados com os dados recebidos
          setFaturamento(data.faturamento_do_dia || 0);

          // Verifica se ultimas_vendas é um objeto (como no seu exemplo) ou array
          if (Array.isArray(data.ultimas_vendas)) {
            setUltimasVendas(data.ultimas_vendas);
          } else if (typeof data.ultimas_vendas === 'object' && data.ultimas_vendas !== null) {
            // Se for um objeto, converte para array
            setUltimasVendas(Object.values(data.ultimas_vendas));
          } else {
            setUltimasVendas([]);
          }

        } else {
          throw new Error("Formato de resposta inesperado da API.");
        }

      } catch (err: any) {
        console.error("Erro ao buscar dados da home:", err);
        setError(err.message || t("saleError")); // Mostra a mensagem de erro real
        setFaturamento(0);
        setUltimasVendas([]);
      } finally {
        setLoading(false);
      }
    }

    carregarHomeData();
  }, [t]);

  return (
    <SafeAreaView style={styles.container}>
      <Header usuario="Andrea" pagina={t("home")} />

      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
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

        {error && !loading && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <UltimasVendas vendasRaw={ultimasVendas} loading={loading} />
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
    color: 'red',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 10,
  }
});