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
        {/* Registrar Entrega */}
        <TouchableOpacity
          style={styles.gestaoButton}
          onPress={() => router.push("/chamadas")}
          activeOpacity={0.85}
        >
          <Icon name="plus" size={50} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Registrar Entrega</Text>
        </TouchableOpacity>

        {/* Registrar Devolução */}
        <TouchableOpacity
          style={styles.gestaoButton}
          onPress={() => router.push("/devolucao")}
          activeOpacity={0.85}
        >
          <Icon name="cart-arrow-up" size={50} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>{t("registerReturnButton")}</Text>
        </TouchableOpacity>

        {/* Histórico de Gestão */}
        <TouchableOpacity
          style={styles.gestaoButton}
          onPress={() => router.push("/historico_gestao")}
          activeOpacity={0.85}
        >
          <Icon name="clock-outline" size={50} color="#fff" style={styles.icon} />
          <Text style={styles.buttonText}>Histórico de Gestão</Text>
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
    gap: 15,
  },
  gestaoButton: {
    backgroundColor: "#FF9800",
    borderRadius: 15,
    width: "100%",
    height: "22%",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,
  },
  icon: {
    marginBottom: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 22,
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


