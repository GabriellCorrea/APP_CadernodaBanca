import { useState } from "react"
import { View, Text, TextInput, StyleSheet, TouchableOpacity, Image } from "react-native"

import { router } from "expo-router"

export default function Login() {
  const [login, setLogin] = useState("")
  const [senha, setSenha] = useState("")

  function handleEntrar() {
    // redireciona para a página home.tsx
    router.push("/home")
  }

  return (
    <View style={styles.wrapper}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../../assets/images/FLUMINENSE.png")} // substitir pela logo certa
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      {/* Card inferior */}
      <View style={styles.card}>
        <Text style={styles.label}>Login:</Text>
        <TextInput
          style={styles.input}
          value={login}
          onChangeText={setLogin}
          placeholder="Digite seu login"
          placeholderTextColor="#999"
        />

        <Text style={styles.label}>Senha:</Text>
        <TextInput
          style={styles.input}
          value={senha}
          onChangeText={setSenha}
          placeholder="Digite sua senha"
          placeholderTextColor="#999"
          secureTextEntry
        />

        <TouchableOpacity>
          <Text style={styles.link}>Esqueci minha senha</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.botao} onPress={handleEntrar}>
          <Text style={styles.botaoTexto}>Entrar</Text>
        </TouchableOpacity>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F2F2F2",
    justifyContent: "flex-start",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 140,
    height: 140,
  },
  card: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    padding: 24,
    paddingTop: 40,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 6,
    elevation: 5,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#E67E22",
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },

  link: {
    color: "#E67E22",
    fontWeight: "500",
    textAlign: "center",
    marginBottom: 24,
    textDecorationLine: "underline",
  },

  botao: {
    backgroundColor: "#E67E22",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
  },
  botaoTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
})
