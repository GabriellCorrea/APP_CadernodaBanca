import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { MaisVendidos } from "@/components/MaisVendidos/MaisVendidos";
import { MetaDoDia } from "@/components/MetaDoDia/MetaDoDia";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Home() {
  const router = useRouter();
  const dadosDaMeta = {
    progresso: 47.72,
    valorAtual: 285.70,
    valorMeta: 600.00,
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header
        usuario="Andrea"
        pagina="Início"
      />

      {/* Conteúdo rolável */}
      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        <MetaDoDia 
          progresso={dadosDaMeta.progresso}
          valorAtual={dadosDaMeta.valorAtual}
          valorMeta={dadosDaMeta.valorMeta}
        />
        <MaisVendidos />

        {/* Botão Registrar Venda na posição normal */}
        <TouchableOpacity
          style={styles.registrarVendaBtn}
          onPress={() => router.push("/vendas")}
        >
          <Text style={styles.registrarVendaText}>+ Registrar Venda</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Barra de navegação fixa no rodapé */}
      <View style={styles.bottomNavContainer}>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F4F4F4",
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 80,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  registrarVendaBtn: {
    marginTop: 24,
    backgroundColor: "#FF9800",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  registrarVendaText: {
    color: "#E0E0E0",
    fontSize: 20,
    fontWeight: "bold",
  },
});