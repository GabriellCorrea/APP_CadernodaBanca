import { useLanguage } from "@/contexts/LanguageContext";
// Removido: import { apiService } from "@/services/api";
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
  numero_edicao: number;
};

// 1. Define as props que o componente espera
type VendasProps = {
  vendasRaw: any[]; // Recebe os dados brutos da API
  loading: boolean; // Recebe o estado de loading do pai
};

export function UltimasVendas({ vendasRaw, loading }: VendasProps) {
  const { t } = useLanguage();
  // 2. Estado interno apenas para os dados *mapeados*
  const [vendasMapeadas, setVendasMapeadas] = useState<VendaRecente[]>([]);

  // 3. Remove o useEffect de busca de dados (fetch)

  // 4. Adiciona um useEffect para *mapear* os dados recebidos via props
  useEffect(() => {
    if (vendasRaw && Array.isArray(vendasRaw)) {
      // Reutiliza a lógica de mapeamento original
      console.log("Mapeando vendasRaw:", vendasRaw);
      const mapeadas = vendasRaw.map((venda: any) => ({
        id_venda: venda.id_venda || venda.id,
        produto_nome: venda.nome || "Produto desconhecido",
        numero_edicao: venda.numero_edicao || "Sem edição",
        produto_imagem: venda.url_revista,
        valor_total: parseFloat(venda.valor_total || venda.valor || 0),
        data_venda: venda.data_venda || venda.created_at || "",
      }));
      // console.log("Vendas mapeadas:", mapeadas);
      setVendasMapeadas(mapeadas);
    } else {
      setVendasMapeadas([]); // Garante que seja um array vazio se a prop for inválida
    }
  }, [vendasRaw]); // Executa o mapeamento quando a prop 'vendasRaw' mudar

  // 5. Usa a prop 'loading'
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
        <Text style={styles.cardEdicao}>Edição: {item.numero_edicao}</Text>
        <Text style={styles.cardPrice}>R$ {item.valor_total.toFixed(2)}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ marginTop: 16 }}>
      <View style={styles.titleContainer}>
        <Feather name="clock" size={20} color="#333" />
        <Text style={styles.title}>{t("lastSales")}</Text>
      </View>

      {/* 6. Usa o estado mapeado 'vendasMapeadas' */}
      <FlatList
        data={vendasMapeadas}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_venda}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false}
        contentContainerStyle={{ paddingBottom: 16 }}
        // Adiciona uma mensagem para quando não houver vendas
        ListEmptyComponent={
          <Text style={{ textAlign: 'center', color: '#777' }}>
            Nenhuma venda registrada hoje.
          </Text>
        }
      />
    </View>
  );
}