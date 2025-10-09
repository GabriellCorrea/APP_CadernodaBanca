import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { MaisVendidos } from "@/components/MaisVendidos/MaisVendidos";
import { MetaDoDia } from "@/components/MetaDoDia/MetaDoDia";
import { useLanguage } from "@/contexts/LanguageContext";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const dadosDaMeta = {
    progresso: 47.72,
    valorAtual: 285.70,
    valorMeta: 600.00,
  };

  return (
    <SafeAreaView style={styles.container}>
     
      <Header
        usuario="Andrea"
        pagina={t('home')}
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


      <TouchableOpacity
        style={styles.fixedRegistrarVendaBtn}
        onPress={() => router.push("/vendas")}
      >
        <Text style={styles.registrarVendaText}>{t('registerSale')}</Text>
      </TouchableOpacity>

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
   
    paddingBottom: 160, 
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
 
  fixedRegistrarVendaBtn: {
     position: 'absolute', 
     bottom: 120, 
    left: 16,  
    right: 16,  
    backgroundColor: "#FF9800",
    borderRadius: 12,
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4, 
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  registrarVendaText: {
     color: "#ffffffff",
     fontSize: 20,
     fontWeight: "bold",
    },
    plusSymbol: {
     color: "#ffffffff",
     fontSize: 28,
     fontWeight: "bold",
     marginRight: 6,
  },
});