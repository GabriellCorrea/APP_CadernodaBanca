
import { useState } from "react";
import { Image, StyleSheet, Text, TextInput, TouchableOpacity, View, Dimensions, KeyboardAvoidingView, Platform, ScrollView, Alert } from "react-native";
import { router } from "expo-router";
import { Feather } from '@expo/vector-icons';
import { apiService } from '@/services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';




export default function Login() {
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleEntrar() {
    if (!login || !senha) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      // Tenta fazer login na API
      const response = await apiService.login(login, senha);
      console.log("🔍 Login response completo:", JSON.stringify(response, null, 2));
      console.log("🔍 Tipo da response:", typeof response);
      console.log("🔍 Keys da response:", Object.keys(response || {}));
      
      // Salva o token (agora sabemos que está em response.token)
      let token = response.token;
      console.log("🔍 Token extraído:", token ? `${token.substring(0, 20)}...` : 'NENHUM TOKEN ENCONTRADO NA RESPONSE');
      
      if (token) {
        // Salva o token no AsyncStorage para persistência
        await AsyncStorage.setItem('authToken', token);
        console.log("✅ Token salvo no AsyncStorage:", token.substring(0, 20) + "...");
        
        // Também salva no global para compatibilidade imediata
        (global as any).authToken = token;
        console.log("✅ Token salvo no global");
        
        // Verifica se foi salvo corretamente
        const savedToken = await AsyncStorage.getItem('authToken');
        console.log("🔍 Verificação - Token recuperado do AsyncStorage:", savedToken ? `${savedToken.substring(0, 20)}...` : 'ERRO: Não conseguiu salvar');
      } else {
        console.warn("Token não encontrado na resposta:", response);
        // Mesmo assim continua, talvez a API não precise de token para alguns endpoints
      }
      
      // Se deu certo, vai para home
      router.push("/home");
    } catch (error) {
      console.error("Erro no login:", error);
      Alert.alert("Erro", "Email ou senha inválidos");
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
        contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingVertical: 32 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={[styles.card, isDesktop && styles.cardDesktop, styles.cardWithLogoUnified]}> 
          <Image
            source={require("../../assets/images/CADERNO-Photoroom.png")}
            style={[styles.logoUnified, isDesktop && styles.logoUnifiedDesktop]}
            resizeMode="contain"
          />
          <Text style={styles.loginTitle}>Login</Text>
          <View style={styles.inputGroup}>
            <Feather name="user" size={20} color="#E67E22" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              value={login}
              onChangeText={setLogin}
              placeholder="Email ou usuário"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              underlineColorAndroid="transparent"
            />
          </View>
          <View style={styles.inputGroup}>
            <Feather name="lock" size={20} color="#E67E22" style={styles.inputIcon} />
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
            <TouchableOpacity onPress={() => setShowPassword((v) => !v)} style={styles.eyeIcon}>
              <Feather name={showPassword ? "eye-off" : "eye"} size={20} color="#E67E22" />
            </TouchableOpacity>
          </View>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }} />
            <TouchableOpacity>
              <Text style={styles.link}>Esqueci minha senha</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity 
            style={[styles.botao, loading && styles.botaoDisabled]} 
            onPress={handleEntrar}
            disabled={loading}
          >
            <Text style={styles.botaoTexto}>
              {loading ? "Entrando..." : "Entrar"}
            </Text>
          </TouchableOpacity>
          <View style={styles.signupRow}>
            <Text style={styles.signupText}>Não tem uma conta?</Text>
            <TouchableOpacity>
              <Text style={styles.signupLink}>Cadastre-se</Text>
            </TouchableOpacity>
          </View>
          {/* Conteúdo extra para forçar scroll no PC/web (remova depois do teste) */}
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
  container: {
    // Removido flex: 1 e minHeight para evitar travar o scroll
    justifyContent: "flex-end",
    alignItems: "center",
  },
  containerDesktop: {
    justifyContent: "center",
    minHeight: 600,
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
    marginBottom: 0,
    alignItems: 'center',
  },
  cardDesktop: {
    borderRadius: 24,
    marginTop: 0,
    marginBottom: 0,
  },
  cardWithLogoUnified: {
    alignItems: 'center',
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
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
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
    width: '100%',
    maxWidth: 340,
    alignSelf: 'center',
  },
  botaoTexto: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
  botaoDisabled: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  footer: {
    marginTop: 18,
    alignItems: 'center',
  },
  footerText: {
    color: '#bbb',
    fontSize: 13,
    fontStyle: 'italic',
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
