import React from 'react';
import { Image, Text, View } from 'react-native';
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Sua importação de ícones
import { styles } from './styles';

type HeaderProps = {
  usuario: string;
  data: string;
  pagina: string;
};

export const Header: React.FC<HeaderProps> = ({ usuario, data, pagina }) => {
  return (
    // Um único container para todo o header
    <View style={styles.headerContainer}>
      
      {/* Parte 1: Saudação */}
      <View style={styles.topSection}>
        {/* Lembre-se de colocar o caminho correto para sua imagem */}
        <Image style={styles.image} source={require("../../../assets/images/CADERNO-Photoroom.png")} /> 
        <Text style={styles.saudacao}>Olá, {usuario}</Text>
        <Image style={styles.flag} source={require("../../../assets/images/Flag_of_Brazil.svg.png")} />
      </View>

      {/* Parte 2: Data */}
      <View style={styles.dateSection}>
        {/* Ícone de calendário adicionado aqui */}
        <Icon name="calendar-month-outline" size={20} color="white" />
        <Text style={styles.data}>{data}</Text>
      </View>

      {/* Parte 3: Página Atual */}
      <View style={styles.pageSection}>
        <Text style={styles.pagina}>{pagina}</Text>
      </View>

    </View>
  );
};