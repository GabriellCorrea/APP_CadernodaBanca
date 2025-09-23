import React from "react";
import { View, Text, Image } from "react-native";
import { styles } from "./styles";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";

type HeaderProps = {
  usuario: string;
  data: string;
  pagina: string; 
};

export function Header({ usuario, data, pagina }: HeaderProps) {
  return (
    <>
      {/* Header principal */}
      <View style={styles.header}>
        {/* Logo */}
        <Image
          source={require("../../../assets/images/FLUMINENSE.png")}
          style={styles.image}
        />

        {/* Saudação */}
        <Text style={styles.saudacao}>Olá, {usuario}</Text>

        {/* Bandeira */}
         <Image
          source={require("../../../assets/images/Flag_of_Brazil.svg.png")}
          style={styles.image}
        />
      </View>

      {/* Container 2 - Data */}
      <View style={styles.container2}>
        <Icon
          name="calendar"
          size={20}
          color="white"
          style={{ marginRight: 8 }}
        />
        <Text style={styles.data}>{data}</Text>
      </View>

      {/* Container 3 - Página */}
      <View style={styles.container3}>
        <Text style={styles.pagina}>{pagina}</Text>
      </View>
    </>
  );
}

