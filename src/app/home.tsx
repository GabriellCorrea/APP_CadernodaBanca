import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { MaisVendidos } from "@/components/MaisVendidos/MaisVendidos";
import { MetaDoDia } from "@/components/MetaDoDia/MetaDoDia";
import React from 'react';
import { ScrollView, StyleSheet } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Home() {
  const dadosDaMeta = {
    progresso: 47.72,
    valorAtual: 285.70,
    valorMeta: 600.00,
  };

  return (
    <SafeAreaView style={styles.container}>
      
      <Header
        usuario="Andreas"
        data="Quarta, 24 de Setembro."
        pagina="Início"
      />
      
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
      </ScrollView>

      <BottomNav />
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
    paddingBottom: 24,
  },
});