
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons';
import axios from 'axios';
import Constants from 'expo-constants';
import { styles } from './styles';


// Tipo para produto retornado da API
type Produto = {
  id: string;
  title: string;
  price: string;
  sales: string;
  image: string; // URL da imagem
};


// Card de produto individual
const CardProduto: React.FC<{ item: Produto }> = ({ item }) => (
  <View style={styles.cardContainer}>
    <Image source={{ uri: item.image }} style={styles.cardImage} resizeMode="cover" />
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPrice}>{item.price}</Text>
      <Text style={styles.cardSales}>Vendas: {item.sales}</Text>
    </View>
  </View>
);


export const MaisVendidos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Busca a URL da API do extra do app.config.js
    const apiUrl = Constants.expoConfig?.extra?.API_URL || "";
    if (!apiUrl) {
      setError("API_URL não configurada.");
      setLoading(false);
      return;
    }

    const buscarProdutos = async () => {
      try {
        const response = await axios.get<Produto[]>(apiUrl);
        setProdutos(response.data);
      } catch (err) {
        setError("Não foi possível carregar os produtos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    buscarProdutos();
  }, []);

  if (loading) {
    return (
      <View style={localStyles.centered}>
        <ActivityIndicator size="large" color="#FFA500" />
        <Text>Carregando produtos...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={localStyles.centered}>
        <Text style={{ color: 'red', textAlign: 'center' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.titleContainer}>
        <Feather name="trending-up" size={22} color="#333" style={{ marginRight: 8 }} />
        <Text style={styles.title}>Mais vendidos</Text>
      </View>
      <FlatList
        data={produtos}
        renderItem={({ item }) => <CardProduto item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
        contentContainerStyle={{ paddingBottom: 16 }}
      />
    </View>
  );
};


// Estilos locais para centralização
const localStyles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});