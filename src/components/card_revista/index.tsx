import React from "react";
import { View, Text, Image } from "react-native";
import { styles } from "./styles";

type CardRevistaProps = {
  imagem: string;
  titulo: string;
  preco: number;
  vendas: number;
  estoque: number;
};

export function CardRevista({
  imagem,
  titulo,
  preco,
  vendas,
  estoque,
}: CardRevistaProps) {
  return (
    <View style={styles.card}>
      <Image
            source={
              typeof imagem === "string"
                ? { uri: imagem }
                : imagem
            }
            style={styles.imagem}
          />
      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={3}>
          {titulo}
        </Text>

        <Text style={styles.preco}>R$ {preco.toFixed(2)}</Text>
        <Text style={styles.textoCinza}>Vendas: {vendas}</Text>
        <Text style={styles.textoCinza}>{estoque} un.</Text>
      </View>
    </View>
  );
}






