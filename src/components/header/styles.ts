import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  // Container principal do header
  headerContainer: {
    backgroundColor: "white",
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },

  // Seção de cima: Foto, Saudação e Bandeira
  topSection: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    height: 60,
    backgroundColor: "white",
  },
  image: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  saudacao: {
    color: "#4E5356",
    fontSize: 22,
    fontWeight: "600",
    flex: 1,
    marginLeft: 10,
  },
  flag: {
    width: 30,
    height: 20,
    resizeMode: "contain",
  },

  // --- ALTERAÇÕES AQUI ---
  // Seção do meio: Data
  dateSection: {
    backgroundColor: "#555",
    height: 40,
    paddingHorizontal: 20,
    flexDirection: "row",     // Adicionado
    alignItems: "center",      // Adicionado
    // justifyContent: "center" // Removido
  },
  data: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,            // Adicionado
  },
  // --- FIM DAS ALTERAÇÕES ---

  // Seção de baixo: Página
  pageSection: {
    backgroundColor: "#D9D9D9",
    height: 40,
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  pagina: {
    color: "#34495E",
    fontSize: 19,
    fontWeight: "700",
  },
});