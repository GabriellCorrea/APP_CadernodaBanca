// NOVO ARQUIVO: src/app/entradas/[id].tsx

import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// Tipo para a revista dentro da ENTRADA
type RevistaEntrada = {
  id_revista: number;
  qtd_entregue: number; // Campo da tabela 'revistas_documentos_entrega'
  revistas: { // Objeto vindo do JOIN
    nome: string;
    numero_edicao: number;
  }
};

// Tipo para o detalhe da ENTRADA
type EntradaDetalhe = {
  id_documento_entrega: number;
  data_entrega: string;
  numero_nota: string;
  // O join vem aqui
  revistas_documentos_entrega: RevistaEntrada[];
};

export default function DetalheEntrada() {
  const { t } = useLanguage();
  const router = useRouter();
  const { id } = useLocalSearchParams(); // Pega o ID da URL

  const [entrada, setEntrada] = useState<EntradaDetalhe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id || typeof id !== 'string') {
      setError("ID da entrada inválido.");
      setLoading(false);
      return;
    }

    const carregarDetalhes = async () => {
      try {
        setLoading(true);
        setError(null);
        // Usar a API de 'entregas' para consultar
        const data = await apiService.entregas.consultar(Number(id));
        setEntrada(data);
      } catch (err: any) {
        console.error("Erro ao carregar detalhes da entrada:", err);
        setError(err.message || "Não foi possível carregar os detalhes.");
      } finally {
        setLoading(false);
      }
    };

    carregarDetalhes();
  }, [id]);

  const renderItemRevista = ({ item }: { item: RevistaEntrada }) => (
    <View style={styles.revistaItem}>
      <View style={styles.revistaInfo}>
        <Text style={styles.revistaNome}>
          {item.revistas.nome || 'Revista desconhecida'}
        </Text>
        <Text style={styles.revistaEdicao}>
          Edição: {item.revistas.numero_edicao || 'N/A'}
        </Text>
      </View>
      {/* Campo correto da tabela de join */}
      <Text style={styles.revistaQtd}>{item.qtd_entregue} un.</Text>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return <ActivityIndicator size="large" color="#E67E22" style={styles.centered} />;
    }

    if (error) {
      return <Text style={[styles.centered, styles.errorText]}>{error}</Text>;
    }

    if (!entrada) {
      return <Text style={styles.centered}>Entrada não encontrada.</Text>;
    }

    return (
      <>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Entrada #{entrada.id_documento_entrega}
          </Text>
          <Text style={styles.headerSubtitle}>
            Data: {new Date(entrada.data_entrega).toLocaleDateString('pt-BR')}
          </Text>
           <Text style={styles.headerStatus}>
            Nota Fiscal: {entrada.numero_nota || 'N/A'}
          </Text>
        </View>

        <Text style={styles.listTitle}>Revistas Recebidas:</Text>
        <FlatList
          data={entrada.revistas_documentos_entrega} // Usar o array correto
          renderItem={renderItemRevista}
          keyExtractor={(item) => item.id_revista.toString()}
          contentContainerStyle={{ paddingBottom: 50 }}
          ListEmptyComponent={<Text style={styles.emptyText}>Nenhuma revista nesta entrada.</Text>}
        />
      </>
    );
  };

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      {/* Adicione a chave 'deliveryDetails' ao seu LanguageContext */}
      <Header usuario="Andrea" pagina={t("deliveryDetails") || "Detalhe da Entrada"} />

      <View style={styles.container}>
        {renderContent()}
      </View>

      {/* Não há botão de confirmação para 'Entrada', então removemos o BottomButtonContainer */}
    </SafeAreaView>
  );
}

// Estilos (copiados de devolucoes/[id].tsx, mas com cores adaptadas)
const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    textAlign: 'center',
    marginTop: 50,
  },
  errorText: {
    color: 'red',
  },
  headerInfo: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#34495E',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#27AE60', // Verde para data de entrada
    marginTop: 4,
    fontWeight: '600',
  },
  headerStatus: {
    fontSize: 16,
    color: '#555',
    marginTop: 4,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#34495E',
    marginBottom: 10,
  },
  revistaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  revistaInfo: {
    flex: 1,
  },
  revistaNome: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
  },
  revistaEdicao: {
    fontSize: 13,
    color: '#777',
    marginTop: 2,
  },
  revistaQtd: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27AE60', // Verde
  },
  emptyText: {
    textAlign: 'center',
    color: '#777',
    marginTop: 20,
  },
});