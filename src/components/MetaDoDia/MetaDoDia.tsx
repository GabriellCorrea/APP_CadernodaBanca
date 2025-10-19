import { useLanguage } from "@/contexts/LanguageContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as React from "react";
import { useState, useEffect } from "react";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Text, View, ActivityIndicator, TouchableOpacity, TextInput } from "react-native";
import { styles } from "./styles";
import { buscarMetaDiaria, buscarVendasDoDia } from "@/services/api";

type Venda = {
  id: number;
  valor: number;
};

export const MetaDoDia: React.FC = () => {
  const { t } = useLanguage();
  const [metaDiaria, setMetaDiaria] = useState<number>(600);
  const [vendasDoDia, setVendasDoDia] = useState<Venda[]>([]);
  const [valorAtual, setValorAtual] = useState(0);
  const [progresso, setProgresso] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [inputMeta, setInputMeta] = useState(metaDiaria.toString());

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [meta, vendas] = await Promise.all([
          buscarMetaDiaria(),
          buscarVendasDoDia()
        ]);
        // Tenta buscar meta do AsyncStorage
        const metaStorage = await AsyncStorage.getItem('metaDiaria');
        if (metaStorage) {
          setMetaDiaria(Number(metaStorage));
          setInputMeta(metaStorage);
        } else {
          setMetaDiaria(meta);
          setInputMeta(meta.toString());
        }
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
        <MaterialCommunityIcons name="target" size={24} color="#333" />
        <Text style={styles.title}>{t('dailyGoal')}</Text>
        <TouchableOpacity onPress={() => setEditMode(true)} style={{marginLeft: 8}}>
          <MaterialCommunityIcons name="pencil" size={20} color="#333" />
        </TouchableOpacity>
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

      {editMode && (
        <View style={{marginTop: 16, backgroundColor: '#fff', padding: 12, borderRadius: 8, elevation: 2}}>
          <Text style={{marginBottom: 8}}>{t('editDailyGoal') || 'Editar meta diária:'}</Text>
          <TextInput
            style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8}}
            keyboardType="numeric"
            value={inputMeta}
            onChangeText={setInputMeta}
          />
          <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
            <TouchableOpacity
              style={{marginRight: 8}}
              onPress={() => setEditMode(false)}
            >
              <Text>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={async () => {
                const newMeta = Number(inputMeta);
                if (!isNaN(newMeta) && newMeta > 0) {
                  setMetaDiaria(newMeta);
                  await AsyncStorage.setItem('metaDiaria', newMeta.toString());
                  setEditMode(false);
                }
              }}
              style={{backgroundColor: '#FF9800', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6}}
            >
              <Text style={{color: '#fff'}}>Salvar</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};