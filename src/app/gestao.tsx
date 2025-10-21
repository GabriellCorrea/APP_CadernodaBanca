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
      <Header usuario="Andrea" pagina={t('management')} />

      <View style={styles.contentCenter}>
        <View style={styles.buttonsContainer}>
          <TouchableOpacity
            style={styles.gestaoButton}
            onPress={() => router.push("/chamadas")}
            activeOpacity={0.85}
          >
            <Icon name="plus" size={70} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>{t('registerCallButton')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gestaoButton}
            onPress={() => router.push("/devolucao")}
            activeOpacity={0.85}
          >
            <Icon name="cart-arrow-up" size={70} color="#fff" style={styles.icon} />
            <Text style={styles.buttonText}>{t('registerReturnButton')}</Text>
          </TouchableOpacity>
        </View>
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
    backgroundColor: "#ffffff",
  },
  contentCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonsContainer: {
    width: "90%",
    alignItems: "center",
  },
  gestaoButton: {
    backgroundColor: "#FF9800",
    borderRadius: 16,
    width: "100%",
    height: "42%",
    paddingVertical: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 8,
  },
  icon: {
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    fontSize: 27,
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

