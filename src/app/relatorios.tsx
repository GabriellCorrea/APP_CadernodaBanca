import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from "react-native"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/barra_navegacao"
import { Ionicons } from "@expo/vector-icons"

export default function Relatorios() {
  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <Header usuario="Andreas" data="Segunda, 08 de Setembro." pagina="Relatórios e Insights" />

    <ScrollView 
      style={[styles.scroll, { marginTop: 150 }]}
      showsVerticalScrollIndicator={false}
    >
      {/* Cards de métricas */}
      <View style={styles.metricsRow}>
        <View style={styles.metricCard}>
          <Ionicons name="cash-outline" size={24} color="#fff" />
          <Text style={styles.metricLabel}>Vendas Hoje</Text>
          <Text style={styles.metricValue}>R$ 285,60</Text>
        </View>

        <View style={styles.metricCard}>
          <Ionicons name="cube-outline" size={24} color="#fff" />
          <Text style={styles.metricLabel}>Produtos</Text>
          <Text style={styles.metricValue}>4</Text>
        </View>
      </View>

        {/* Vendas da semana */}
        <Text style={styles.sectionTitle}>Vendas da semana</Text>
        {["seg", "ter", "qua", "qui", "sex", "sab", "dom"].map((dia, index) => (
          <View key={index} style={styles.weekRow}>
            <Text style={styles.weekDay}>{dia}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(index + 1) * 15}%` }]} />
            </View>
            <Text style={styles.weekValue}>R$ 100,00</Text>
          </View>
        ))}
        <Text style={styles.ticket}>Ticket médio <Text style={{ fontWeight: "bold" }}>R$ 17.85</Text></Text>

        {/* Mais vendidos */}
        <Text style={styles.sectionTitle}>Mais vendidos</Text>
        {[
          { titulo: "Revista Coletânea 108", vendas: "15 vendas", valor: "R$ 190,00" },
          { titulo: "Revista Coquetel Sudoku", vendas: "10 vendas", valor: "R$ 80,00" },
          { titulo: "Revista manga Henshin", vendas: "8 vendas", valor: "R$ 125,00" },
        ].map((item, index) => (
          <View key={index} style={styles.itemRow}>
            <View style={styles.itemCircle}>
              <Text style={styles.itemRank}>{index + 1}</Text>
            </View>
            <View style={styles.itemInfo}>
              <Text style={styles.itemTitle}>{item.titulo}</Text>
              <Text style={styles.itemSubtitle}>{item.vendas}</Text>
            </View>
            <Text style={styles.itemValue}>{item.valor}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Bottom nav */}
      <BottomNav />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scroll: {
    padding: 16,
  },
  metricsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  metricCard: {
    flex: 1,
    backgroundColor: "#E67E22",
    marginHorizontal: 6,
    borderRadius: 10,
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  metricLabel: {
    color: "#fff",
    fontSize: 14,
    marginTop: 8,
  },
  metricValue: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 12,
    color: "#2C3E50",
  },
  weekRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  weekDay: {
    width: 40,
    fontWeight: "600",
    color: "#34495E",
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: "#D6DBDF",
    borderRadius: 8,
    marginHorizontal: 8,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#E67E22",
    borderRadius: 8,
  },
  weekValue: {
    width: 80,
    textAlign: "right",
    color: "#2C3E50",
  },
  ticket: {
    marginTop: 12,
    marginBottom: 24,
    color: "#34495E",
  },
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  itemCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#D5F5E3",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  itemRank: {
    fontWeight: "700",
    color: "#27AE60",
  },
  itemInfo: {
    flex: 1,
  },
  itemTitle: {
    fontWeight: "600",
    color: "#2C3E50",
  },
  itemSubtitle: {
    fontSize: 12,
    color: "#7F8C8D",
  },
  itemValue: {
    fontWeight: "600",
    color: "#E67E22",
  },
})
