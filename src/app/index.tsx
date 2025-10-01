import { useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage"; 

export default function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function signInWithEmail() {
    if (!login || !senha) {
      Alert.alert("Erro", "Preencha email e senha");
      return;
    }

    try {
      setLoading(true);

      const {
        data: { session },
        error,
      } = await supabase.auth.signInWithPassword({
        email: login,
        password: senha,
      });

      if (error) {
        Alert.alert("Erro", error.message);
      } else if (session) {
        await AsyncStorage.setItem("access_token", session.access_token)
        await AsyncStorage.setItem("refresh_token", session.refresh_token)
        router.replace("/home");
      }
    } catch (err) {
      Alert.alert("Erro inesperado", String(err));
    } finally {
      setLoading(false);
    }
  }

  const { width } = Dimensions.get("window");
  const isDesktop = width >= 700;

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: "center",
          paddingVertical: 32,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.card,
            isDesktop && styles.cardDesktop,
            styles.cardWithLogoUnified,
          ]}
        >
          <Image
            source={require("../../assets/images/CADERNO-Photoroom.png")}
            style={[styles.logoUnified, isDesktop && styles.logoUnifiedDesktop]}
            resizeMode="contain"
          />
          <Text style={styles.loginTitle}>Login</Text>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Feather
              name="user"
              size={20}
              color="#E67E22"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={login}
              onChangeText={setLogin}
              placeholder="Email"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              underlineColorAndroid="transparent"
            />
          </View>

          {/* Senha */}
          <View style={styles.inputGroup}>
            <Feather
              name="lock"
              size={20}
              color="#E67E22"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.input}
              value={senha}
              onChangeText={setSenha}
              placeholder="Senha"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoCorrect={false}
              underlineColorAndroid="transparent"
            />
            <TouchableOpacity
              onPress={() => setShowPassword((v) => !v)}
              style={styles.eyeIcon}
            >
              <Feather
                name={showPassword ? "eye-off" : "eye"}
                size={20}
                color="#E67E22"
              />
            </TouchableOpacity>
          </View>

          {/* Link esqueci senha */}
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity>
              <Text style={styles.link}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>

          {/* Botão de login */}
          <TouchableOpacity
            style={[styles.botao, loading && { opacity: 0.7 }]}
            onPress={signInWithEmail}
            disabled={loading}
          >
            <Text style={styles.botaoTexto}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>

          {/* Cadastro */}
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Não tem uma conta?</Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>

          {/* Rodapé */}
          <View style={{ height: 300 }} />
          <View style={styles.footer}>
            <Text style={styles.footerText}>Produzido pelo IBMEC - 2025</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F2F2F2",
  },
  card: {
    width: "100%",
    maxWidth: 400,
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 28,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 5,
    alignSelf: "center",
    alignItems: "center",
  },
  cardDesktop: {
    borderRadius: 24,
  },
  cardWithLogoUnified: {
    alignItems: "center",
    paddingTop: 32,
  },
  logoUnified: {
    width: 240,
    height: 240,
    marginBottom: 10,
    marginTop: -10,
  },
  logoUnifiedDesktop: {
    width: 320,
    height: 320,
    marginBottom: 18,
    marginTop: -18,
  },
  loginTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 18,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  inputGroup: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E67E22",
    borderRadius: 8,
    backgroundColor: "#FAFAFA",
    marginBottom: 16,
    paddingHorizontal: 10,
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
  },
  inputIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 15,
    color: "#333",
    backgroundColor: "transparent",
    borderWidth: 0,
    minWidth: 0,
  },
  eyeIcon: {
    padding: 4,
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  link: {
    color: "#E67E22",
    fontWeight: "500",
    textAlign: "right",
    textDecorationLine: "underline",
    fontSize: 14,
  },
  botao: {
    backgroundColor: "#E67E22",
    paddingVertical: 16,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 4,
    marginBottom: 18,
    width: "100%",
    maxWidth: 340,
    alignSelf: "center",
  },
  botaoTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  footer: {
    marginTop: 18,
    alignItems: "center",
  },
  footerText: {
    color: "#bbb",
    fontSize: 13,
    fontStyle: "italic",
    letterSpacing: 0.2,
  },
  signupRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 6,
  },
  signupText: {
    color: "#888",
    fontSize: 14,
    marginRight: 4,
  },
  signupLink: {
    color: "#E67E22",
    fontWeight: "600",
    fontSize: 14,
    textDecorationLine: "underline",
  },
});
