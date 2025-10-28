import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Feather } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { styles } from "./styles";

type VendaRecente = {
  id_venda: string;
  produto_nome: string;
  produto_imagem?: string;
  valor_total: number;
  data_venda: string;
};

export function UltimasVendas() {
  const { t } = useLanguage();
  const [vendas, setVendas] = useState<VendaRecente[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarUltimasVendas() {
      try {
        setLoading(true);
        const data = await apiService.vendas.getRecentes();

        // Mapeia os dados da API para um formato consistente
        const vendasMapeadas = data.map((venda: any) => ({
          id_venda: venda.id_venda || venda.id,
          produto_nome: venda.revista || "Produto desconhecido",
          produto_imagem: venda.produto_imagem,
          valor_total: parseFloat(venda.valor_total || venda.valor || 0),
          data_venda: venda.data_venda || venda.created_at || "",
        }));

        setVendas(vendasMapeadas);
      } catch (error) {
        console.error("Erro ao buscar últimas vendas:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarUltimasVendas();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <ActivityIndicator size="large" color="#E67E22" />
        <Text>{t("loadingLastSales")}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: VendaRecente }) => (
    <View style={styles.cardContainer}>
      <Image
        source={
          item.produto_imagem
            ? { uri: item.produto_imagem }
            : require("../../../assets/images/imagem-placeholder.png")
        }
        style={styles.cardImage}
      />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.produto_nome}</Text>
        <Text style={styles.cardPrice}>R$ {item.valor_total.toFixed(2)}</Text>
        <Text style={styles.cardSales}>
          {new Date(item.data_venda).toLocaleDateString("pt-BR")}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={{ marginTop: 16 }}>
      <View style={styles.titleContainer}>
        <Feather name="clock" size={20} color="#333" />
        <Text style={styles.title}>Últimas Vendas</Text>
      </View>

      <FlatList
        data={vendas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_venda}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}

