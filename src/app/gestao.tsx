import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

export default function Gestao() {
  const router = useRouter();
  const { t } = useLanguage();

  return (
    <SafeAreaView style={styles.container}>
      <Header usuario="Andrea" pagina={t("management")} />

      <View style={styles.buttonsContainer}>
        {/* Registrar Entrada */}
        <TouchableOpacity
          style={[styles.gestaoButton, styles.entradaButton]}
          onPress={() => router.push("/entradas")}
          activeOpacity={0.85}
        >
          <Icon name="package-down" size={50} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>{t("delivery")}</Text>
        </TouchableOpacity>

        {/* Acompanhar Devoluções */}
        <TouchableOpacity
          style={[styles.gestaoButton, styles.devolucaoButton]}
          onPress={() => router.push("/devolucoes")}
          activeOpacity={0.85}
        >
          <Icon name="package-up" size={50} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>{t("return")}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.bottomNavContainer}>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  buttonsContainer: {
    marginTop: -70,
    flex: 1,
    justifyContent: "center", // centraliza o grupo de botões
    alignItems: "center",
    paddingHorizontal: 20,
    gap: 20, // Aumenta o espaço entre os botões
  },
  gestaoButton: {
    borderRadius: 15,
    width: "100%",
    height: "30%", // Botões maiores
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  // Cores diferentes para os botões
  entradaButton: {
    backgroundColor: "#27AE60", // Verde
  },
  devolucaoButton: {
    backgroundColor: "#E67E22", // Laranja (original)
  },
  icon: {
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 24, // Fonte maior
    fontWeight: "bold",
    textAlign: "center",
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});