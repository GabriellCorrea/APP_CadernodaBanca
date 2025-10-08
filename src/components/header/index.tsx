import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View, Text } from "react-native";
import { Image } from "expo-image";
import { styles } from "./styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { LanguageSelector } from "../languageSelector";
import { useLanguage } from "../../contexts/LanguageContext";

type HeaderProps = {
  usuario: string;
  pagina: string;
};

export function Header({ usuario, pagina }: HeaderProps) {
  const { t, currentLanguage } = useLanguage();
  
  // Pega a data atual
  const hoje = new Date();
  const locale = currentLanguage === 'pt' ? 'pt-BR' : 'it-IT';
  const dataFormatada = hoje.toLocaleDateString(locale, {
    weekday: "long", // segunda-feira
    day: "2-digit",  // 30
    month: "long",   // setembro
    year: "numeric", // 2025
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top"]}>
      {/* Header principal */}
      <View style={styles.header}>
        {/* Logo */}
        <Image
          source={require("../../../assets/images/CADERNO (1)-Photoroom.png")}
          style={styles.image_caderno}
        />

        {/* Saudação */}
        <Text style={styles.saudacao}>{t('hello')}, {usuario}</Text>

        {/* Seletor de idioma */}
        <LanguageSelector />
      </View>

      {/* Container 2 - Data */}
      <View style={styles.container2}>
        <Icon name="calendar" size={20} color="white" style={{ marginRight: 8 }} />
        <Text style={styles.data}>{dataFormatada}</Text>
      </View>

      {/* Container 3 - Página */}
      <View style={styles.container3}>
        <Text style={styles.pagina}>{pagina}</Text>
      </View>
    </SafeAreaView>
  );
}

