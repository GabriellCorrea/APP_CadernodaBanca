import { useLanguage } from "@/contexts/LanguageContext";
import { MaterialCommunityIcons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as React from "react";
import { useEffect, useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { styles } from "./styles";

// 1. Define a prop para receber o faturamento
type MetaProps = {
  faturamentoDoDia: number;
};

export const MetaDoDia: React.FC<MetaProps> = ({ faturamentoDoDia }) => {
  const { t } = useLanguage();
  const [metaDiaria, setMetaDiaria] = useState<number>(600); // Meta continua sendo gerenciada aqui
  // Removido: const [vendasDoDia, setVendasDoDia] = useState<Venda[]>([]);
  const [valorAtual, setValorAtual] = useState(0); // Será atualizado pela prop
  const [progresso, setProgresso] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // Loading apenas para a meta (AsyncStorage)
  const [editMode, setEditMode] = useState(false);
  const [inputMeta, setInputMeta] = useState(metaDiaria.toString());

  // 2. Simplifica o useEffect para carregar apenas a META do AsyncStorage
  useEffect(() => {
    const carregarMeta = async () => {
      try {
        setIsLoading(true);
        // Tenta buscar meta do AsyncStorage
        const metaStorage = await AsyncStorage.getItem('metaDiaria');
        if (metaStorage) {
          setMetaDiaria(Number(metaStorage));
          setInputMeta(metaStorage);
        } else {
          setMetaDiaria(600); // Valor padrão
          setInputMeta('600');
        }
      } catch (error) {
        console.error('Erro ao carregar meta:', error);
        setMetaDiaria(600); // valor padrão
        setInputMeta('600');
      } finally {
        setIsLoading(false);
      }
    };
    carregarMeta();

    // Removida a atualização periódica, pois os dados vêm da tela Home
  }, []);

  // 3. Atualiza o progresso baseado na PROP 'faturamentoDoDia'
  useEffect(() => {
    const totalVendas = faturamentoDoDia || 0; // Usa a prop recebida
    const porcentagemProgresso = (totalVendas / metaDiaria) * 100;

    setValorAtual(totalVendas);
    setProgresso(Math.min(porcentagemProgresso, 100)); // Limita o progresso a 100%
  }, [faturamentoDoDia, metaDiaria]); // Reage à mudança da prop e da meta

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
        <TouchableOpacity onPress={() => setEditMode(true)} style={styles.editButton}>
          <MaterialCommunityIcons name="pencil" size={28} color="#FF9800" />
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

      {/* O modal de edição da META continua funcionando igual */}
      {editMode && (
        <View style={styles.editModal}>
          <Text style={styles.editModalTitle}>{t('editDailyGoal')}:</Text>
          <TextInput
            style={styles.editInput}
            keyboardType="numeric"
            value={inputMeta}
            onChangeText={setInputMeta}
          />
          <View style={styles.editButtonsRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setEditMode(false)}
            >
              <Text style={styles.cancelButtonText}>{t('cancel')}</Text>
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
              style={styles.saveButton}
            >
              <Text style={styles.saveButtonText}>{t('confirm')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};