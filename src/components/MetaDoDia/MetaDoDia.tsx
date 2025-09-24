import React from "react";
import { Text, View } from "react-native";
import { MaterialCommunityIcons } from '@expo/vector-icons'; // 1. Importa o pacote de ícones
import { styles } from "./styles";

type MetaProps = {
  progresso: number;
  valorAtual: number;
  valorMeta: number;
};

export const MetaDoDia: React.FC<MetaProps> = ({ progresso, valorAtual, valorMeta }) => {
  
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        {/* 2. Adiciona o componente do ícone aqui */}
        <MaterialCommunityIcons name="target" size={24} color="#333" />
        <Text style={styles.title}>Meta do dia</Text>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>Progresso</Text>
        <Text style={styles.progressPercentage}>{progresso.toFixed(2)}%</Text>
      </View>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progresso}%` }]} />
      </View>

      <View style={styles.valuesRow}>
        <Text style={styles.currentValue}>{formatCurrency(valorAtual)}</Text>
        <Text style={styles.goalValue}>{formatCurrency(valorMeta)}</Text>
      </View>
    </View>
  );
};