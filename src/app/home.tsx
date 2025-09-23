import { View, Text, StyleSheet } from "react-native"

import { router } from "expo-router"

import { Header } from "@/components/header"
import { BottomNav } from "@/components/barra_navegacao"

export default function Home(){

    return (
        <View style={styles.container}>

            <Header usuario="Andreas" data="Segunda, 08 de Setembro." pagina="Início" />

            <Text style={styles.title}> Home</Text>
            
            <BottomNav/>
        </View>
    )
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
  },
  
  title: {
    fontSize: 18,
    fontWeight: "bold",
  }
})
