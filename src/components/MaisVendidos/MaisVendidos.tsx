import React, { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, FlatList, Image } from "react-native";
import { Feather } from "@expo/vector-icons";
import { apiService } from "@/services/api";
import { styles } from "./styles";

type Revista = {
  id_revista: string;
  nome: string;
  imagem: string;
  preco_liquido: number;
};

type ItemMaisVendido = {
  id_revista: string;
  nome: string;
  imagem: string;
  preco: number;
  totalVendido: number;
  qtdVendida: number;
};

export function MaisVendidos() {
  const [maisVendidos, setMaisVendidos] = useState<ItemMaisVendido[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function carregarMaisVendidos() {
      try {
        setLoading(true);

        const [vendas, revistas] = await Promise.all([
          apiService.getVendas(),
          apiService.getRevistas(),
        ]);

        const mapa = new Map<string, ItemMaisVendido>();

        for (const venda of vendas) {
          const revista = revistas.find((r: Revista) => r.id_revista === venda.id_produto);
          if (!revista) continue;

          const existente = mapa.get(venda.id_produto) || {
            id_revista: revista.id_revista,
            nome: revista.nome,
            imagem: revista.imagem,
            preco: revista.preco_liquido,
            totalVendido: 0,
            qtdVendida: 0,
          };

          existente.qtdVendida += venda.qtd_vendida;
          existente.totalVendido += venda.qtd_vendida * revista.preco_liquido;
          mapa.set(venda.id_produto, existente);
        }

        const lista = Array.from(mapa.values()).sort(
          (a, b) => b.qtdVendida - a.qtdVendida
        );

        setMaisVendidos(lista);
      } catch (error) {
        console.error("Erro ao buscar mais vendidos:", error);
      } finally {
        setLoading(false);
      }
    }

    carregarMaisVendidos();
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 16 }}>
        <ActivityIndicator size="large" color="#E67E22" />
        <Text>Carregando mais vendidos...</Text>
      </View>
    );
  }

  const renderItem = ({ item }: { item: ItemMaisVendido }) => (
    <View style={styles.cardContainer}>
      <Image
        source={
          item.imagem
            ? { uri: item.imagem }
            : require("../../../assets/images/imagem-placeholder.png")
        }
        style={styles.cardImage}
      />
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.nome}</Text>
        <Text style={styles.cardPrice}>R$ {item.totalVendido.toFixed(2)}</Text>
        <Text style={styles.cardSales}>Qtd: {item.qtdVendida}</Text>
      </View>
    </View>
  );

  return (
    <View style={{ marginTop: 16 }}>
      {/* Título com ícone */}
      <View style={styles.titleContainer}>
        <Feather name="trending-up" size={20} color="#333" />
        <Text style={styles.title}>Mais vendidos</Text>
      </View>

      {/* Lista em duas colunas */}
      <FlatList
        data={maisVendidos}
        renderItem={renderItem}
        keyExtractor={(item) => item.id_revista}
        numColumns={2}
        columnWrapperStyle={styles.row}
        scrollEnabled={false} // para não conflitar com ScrollView da Home
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
}
