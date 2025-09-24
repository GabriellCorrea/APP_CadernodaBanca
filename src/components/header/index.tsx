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
  // Remova a chamada para o hook 'useSafeAreaInsets'

  return (
    // Volte a usar apenas o 'styles.headerContainer'
    <View style={styles.headerContainer}>
      
      <View style={styles.topSection}>
        <Image style={styles.image} source={require("@/assets/CADERNO-Photoroom.png")} /> 
        <Text style={styles.saudacao}>Olá, {usuario}</Text>
        <Image style={styles.flag} source={require("@/assets/Flag_of_Brazil.png")} />
      </View>

      <View style={styles.dateSection}>
        <Icon name="calendar-month-outline" size={20} color="white" />
        <Text style={styles.data}>{data}</Text>
      </View>

      <View style={styles.pageSection}>
        <Text style={styles.pagina}>{pagina}</Text>
      </View>

    </View>
  );
};