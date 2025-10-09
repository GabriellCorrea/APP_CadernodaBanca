import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function Relatorios() {
  const { t } = useLanguage();
  
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Header 
        usuario="Andreas" 
        pagina={t('reportsAndInsights')} 
      />

      {/* Conteúdo rolável */}
      <ScrollView
        style={styles.scrollViewContainer}
        contentContainerStyle={styles.scrollContentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Cards de métricas */}
        <View style={styles.metricsRow}>
          <View style={styles.metricCard}>
            <Ionicons name="cash-outline" size={24} color="#fff" />
            <Text style={styles.metricLabel}>{t('salesToday')}</Text>
            <Text style={styles.metricValue}>R$ 285,60</Text>
          </View>

          <View style={styles.metricCard}>
            <Ionicons name="cube-outline" size={24} color="#fff" />
            <Text style={styles.metricLabel}>{t('products')}</Text>
            <Text style={styles.metricValue}>4</Text>
          </View>
        </View>

        {/* Vendas da semana */}
        <Text style={styles.sectionTitle}>{t('weekSales')}</Text>
        {[t('monAbbr'), t('tueAbbr'), t('wedAbbr'), t('thuAbbr'), t('friAbbr'), t('satAbbr'), t('sunAbbr')].map((dia, index) => (
          <View key={index} style={styles.weekRow}>
            <Text style={styles.weekDay}>{dia}</Text>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: `${(index + 1) * 15}%` }]} />
            </View>
            <Text style={styles.weekValue}>R$ 100,00</Text>
          </View>
        ))}
        <Text style={styles.ticket}>{t('averageTicket')} <Text style={{ fontWeight: "bold" }}>R$ 17.85</Text></Text>

        {/* Mais vendidos */}
        <Text style={styles.sectionTitle}>{t('topSellers')}</Text>
        {[
          { titulo: "Revista Coletânea 108", vendas: `15 ${t('sales')}`, valor: "R$ 190,00" },
          { titulo: "Revista Coquetel Sudoku", vendas: `10 ${t('sales')}`, valor: "R$ 80,00" },
          { titulo: "Revista manga Henshin", vendas: `8 ${t('sales')}`, valor: "R$ 125,00" },
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

      {/* Barra de navegação fixa no rodapé */}
      <View style={styles.bottomNavContainer}>
        <BottomNav />
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  // ESTILOS DE LAYOUT ADAPTADOS (IGUAIS AOS DA HOME)
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  scrollViewContainer: {
    flex: 1,
  },
  scrollContentContainer: {
    padding: 16,
    paddingBottom: 90, // Espaço extra para não sobrepor o BottomNav
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },

  // SEUS ESTILOS ORIGINAIS (NÃO FORAM ALTERADOS)
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