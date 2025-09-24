import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, ImageSourcePropType, StyleSheet, Text, View } from 'react-native';
import { Feather } from '@expo/vector-icons'; // 1. Importa a família de ícones Feather

import { styles } from './styles';

type Produto = {
  id: string;
  title: string;
  price: string;
  sales: string;
  image: ImageSourcePropType; 
};

const CardProduto: React.FC<{ item: Produto }> = ({ item }) => (
  <View style={styles.cardContainer}>
    {/* Se a API retornar uma URL, você usaria: source={{ uri: item.image }} */}
    <Image source={item.image} style={styles.cardImage} /> 
    <View style={styles.cardTextContainer}>
      <Text style={styles.cardTitle}>{item.title}</Text>
      <Text style={styles.cardPrice}>{item.price}</Text>
      <Text style={styles.cardSales}>Vendas: {item.sales}</Text>
    </View>
  </View>
);

export const MaisVendidos: React.FC = () => {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState<boolean>(true); 
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const apiUrl = "https://sua-api.com/mais-vendidos";

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
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View>
      <View style={styles.titleContainer}>
        {/* 2. Adiciona o ícone aqui */}
        <Feather name="trending-up" size={22} color="#333" />
        <Text style={styles.title}>Mais vendidos</Text>
      </View>
      <FlatList
        data={produtos}
        renderItem={({ item }) => <CardProduto item={item} />}
        keyExtractor={(item) => item.id}
        numColumns={2}
        scrollEnabled={false}
        columnWrapperStyle={styles.row}
      />
    </View>
  );
}

const localStyles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  }
});