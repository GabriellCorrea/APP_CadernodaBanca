import { BottomNav } from "@/components/barra_navegacao";
import { Header } from "@/components/header";
import { MaisVendidos } from "@/components/MaisVendidos/MaisVendidos";
import { MetaDoDia } from "@/components/MetaDoDia/MetaDoDia";
import { useLanguage } from "@/contexts/LanguageContext";
import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { ScrollView, StyleSheet, Text, TouchableOpacity, View, Modal, TextInput } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";


export default function Home() {
  const router = useRouter();
  const { t } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const [inputMeta, setInputMeta] = useState('');
  const [currentMeta, setCurrentMeta] = useState('600');

  useEffect(() => {
    const metaStorage = localStorage.getItem('metaDiaria');
    if (metaStorage) {
      setCurrentMeta(metaStorage);
    }
  }, [modalVisible]);

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
        <MetaDoDia />
        <MaisVendidos />
        <TouchableOpacity
          style={{marginTop: 16, backgroundColor: '#FF9800', padding: 12, borderRadius: 8, alignSelf: 'center'}}
          onPress={() => setModalVisible(true)}
        >
          <Text style={{color: '#fff', fontWeight: 'bold'}}>Editar Meta Diária</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.3)'}}>
          <View style={{backgroundColor: '#fff', padding: 24, borderRadius: 12, width: '80%'}}>
            <Text style={{marginBottom: 8}}>Meta diária atual: {currentMeta}</Text>
            <TextInput
              style={{borderWidth: 1, borderColor: '#ccc', borderRadius: 6, padding: 8, marginBottom: 8}}
              keyboardType="numeric"
              value={inputMeta}
              onChangeText={setInputMeta}
              placeholder="Nova meta diária"
            />
            <View style={{flexDirection: 'row', justifyContent: 'flex-end'}}>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={{marginRight: 8}}>
                <Text>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  const newMeta = Number(inputMeta);
                  if (!isNaN(newMeta) && newMeta > 0) {
                    localStorage.setItem('metaDiaria', newMeta.toString());
                    setCurrentMeta(newMeta.toString());
                    setModalVisible(false);
                    setInputMeta('');
                  }
                }}
                style={{backgroundColor: '#FF9800', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 6}}
              >
                <Text style={{color: '#fff'}}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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