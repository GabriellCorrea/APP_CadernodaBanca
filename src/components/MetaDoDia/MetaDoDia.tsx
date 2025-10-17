import { useLanguage } from "@/contexts/LanguageContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from "react";
import { useState, useEffect } from "react";
import { Text, View, ActivityIndicator } from "react-native";
import { styles } from "./styles";
import { buscarMetaDiaria, buscarVendasDoDia } from "@/services/api";

type Venda = {
  id: number;
  valor: number;
};

export const MetaDoDia: React.FC = () => {
  const { t } = useLanguage();
  const [metaDiaria, setMetaDiaria] = useState(600);
  const [vendasDoDia, setVendasDoDia] = useState<Venda[]>([]);
  const [valorAtual, setValorAtual] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [meta, vendas] = await Promise.all([
          buscarMetaDiaria(),
          buscarVendasDoDia()
        ]);

        setMetaDiaria(meta);
        setVendasDoDia(vendas);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    carregarDados();

    // Atualizar dados a cada 5 minutos
    const interval = setInterval(carregarDados, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const totalVendas = vendasDoDia.reduce((total, venda) => total + venda.valor, 0);
    const porcentagemProgresso = (totalVendas / metaDiaria) * 100;
    
    setValorAtual(totalVendas);
    setProgresso(Math.min(porcentagemProgresso, 100)); // Limita o progresso a 100%
  }, [vendasDoDia, metaDiaria]);

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
        <Text style={styles.title}>{t('dailyGoal')}</Text>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.progressLabel}>{t('progress')}</Text>
        <Text style={styles.progressPercentage}>{progresso.toFixed(2)}%</Text>
      </View>

      <View style={styles.progressBarBackground}>
        <View style={[styles.progressBarFill, { width: `${progresso}%` }]} />
      </View>

      <View style={styles.valuesRow}>
        <Text style={styles.currentValue}>{formatCurrency(valorAtual)}</Text>
        <Text style={styles.goalValue}>{formatCurrency(metaDiaria)}</Text>
      </View>
    </View>
  );
};