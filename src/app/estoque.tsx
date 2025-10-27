import { BottomNav } from "@/components/barra_navegacao";
import { CardRevista } from "@/components/card_revista";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
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

  const filtros = ["Todos", "À mostra", "Em estoque"];

  useEffect(() => {
    async function carregarRevistas() {
      try {
        setLoading(true);
        const revistas = await apiService.revistas.getTudo();
        setProdutos(revistas);
      } catch (error) {
        console.error("❌ Erro ao buscar revistas:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarRevistas();
  }, []);

  const getFilterLabel = (filter: string) => {
    switch (filter) {
      case "Todos": return t('all');
      case "À mostra": return t('onDisplay');
      case "Em estoque": return t('inStock');
      default: return filter;
    }
  };

  const contagemFiltros: Record<string, number> = {
    Todos: produtos.length,
    "À mostra": produtos.filter((p) => p.estoque <= 10).length,
    "Em estoque": produtos.filter((p) => p.estoque > 0).length,
  };

  const produtosFiltrados = produtos
    .filter((p) => {
      if (filtro === "Todos") return true;
      if (filtro === "À mostra") return p.estoque <= 10;
      if (filtro === "Em estoque") return p.estoque > 0;
      return true;
    })
    .filter((p) =>
      (p.titulo || p.nome || "")
        .toLowerCase()
        .includes(busca.toLowerCase())
    );

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
              imagem={p.imagem ? { uri: p.imagem } : require("../../assets/images/imagem-placeholder.png")}
              titulo={p.nome || "Sem título"}
              preco={p.preco_liquido || 0}
              vendas={p.vendas || 0}
              estoque={p.qtd_estoque || 0}
            />
            ))}
        </ScrollView>
      </View>

      {/* Barra fixa no rodapé */}
      <View style={styles.bottomNavContainer}>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

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



