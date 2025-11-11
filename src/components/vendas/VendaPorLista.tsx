import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { ProdutoEstoque } from "../../app/(tabs)/vendas";

type VendaPorListaProps = {
  onProdutoSelecionado: (produto: ProdutoEstoque) => void;
};

export function VendaPorLista({ onProdutoSelecionado }: VendaPorListaProps) {
  const { t } = useLanguage();
  const [produtos, setProdutos] = useState<ProdutoEstoque[]>([]);
  const [busca, setBusca] = useState("");
  const [loadingProdutos, setLoadingProdutos] = useState(true);

  useEffect(() => {
    async function carregarEstoque() {
      try {
        setLoadingProdutos(true);
        const data = await apiService.revistas.estoque();
        setProdutos(data || []);
      } catch (error) {
        console.error("Erro ao carregar estoque para venda:", error);
        Alert.alert(t("error"), "Não foi possível carregar os produtos.");
      } finally {
        setLoadingProdutos(false);
      }
    }
    carregarEstoque();
  }, [t]);

  const produtosFiltrados = useMemo(() => {
    if (!busca) return produtos;
    return produtos.filter((p) =>
      p.nome.toLowerCase().includes(busca.toLowerCase())
    );
  }, [busca, produtos]);


  const renderProdutoItem = (item: ProdutoEstoque) => {
    
    if (item.url_revista && typeof item.url_revista === 'string') {
      const separator = item.url_revista.includes('?') ? '&' : '?';
      const cacheBustedUrl = `${item.url_revista}${separator}timestamp=${new Date().getTime()}`;
      item = { ...item, imagem: { uri: cacheBustedUrl } };
    }
    if (!item.codigo_barras && item.qtd_estoque > 0) {
    return (
      <TouchableOpacity
        key={item.id_revista.toString()}
        style={styles.itemLista}
        onPress={() => onProdutoSelecionado(item)}
      >
        <Image
          source={
            item.imagem
              ? item.imagem
              : require("../../../assets/images/imagem-placeholder.png")
          }
          style={styles.itemImagem}
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemNome}>{item.nome}</Text>
          <Text style={styles.itemPreco}>{t('edition')}: {item.numero_edicao}</Text>
          <Text style={styles.itemPreco}>
            R$ {(item.preco_capa).toFixed(2)}
          </Text>
        </View>
        <Ionicons name="add-circle" size={32} color="#E67E22" />
      </TouchableOpacity>
      )
    } else return null;
  };

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder={t("searchMagazine")}
          placeholderTextColor="#666"
          value={busca}
          onChangeText={setBusca}
        />
      </View>
      
      <ScrollView style={styles.listaContainer}>
        {loadingProdutos ? (
          <ActivityIndicator
            size="large"
            color="#E67E22"
            style={{ marginTop: 40 }}
          />
        ) : (
          <View style={{ paddingBottom: 100 }}>
            {produtosFiltrados.length === 0 ? (
              <Text style={styles.listaVaziaText}>{t("noMagazineFound")}</Text>
            ) : (
              produtosFiltrados.map(renderProdutoItem)
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    marginBottom: 12,
    width: '100%',
    height: 48
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    color: "#434343",
    fontSize: 16,
  },
  listaContainer: {
    flex: 1,
  },
  itemLista: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  itemImagem: {
    width: 40,
    height: 50,
    borderRadius: 4,
    marginRight: 12,
    resizeMode: "cover",
    backgroundColor: "#e0e0e0",
  },
  itemInfo: {
    flex: 1,
    marginRight: 10,
  },
  itemNome: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
  },
  itemPreco: {
    fontSize: 13,
    color: "#000",
    marginTop: 2,
  },
  listaVaziaText: {
    textAlign: "center",
    marginTop: 20,
    color: "#777",
    fontSize: 16,
  },
});