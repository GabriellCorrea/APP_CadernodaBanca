import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  card: {
    width: 160,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    overflow: "hidden",
  },
  imagem: {
    width: "100%",
    height: 150,
    resizeMode: "cover",
  },
  info: {
    padding: 6,
  },
  titulo: {
    fontWeight: "bold",
    fontSize: 12,
    color: "#1E2A38",
    marginBottom: 3,
  },
  preco: {
    color: "#E15610",
    fontSize: 12,
    fontWeight: "bold",
    marginBottom: 2,
  },
  textoCinza: {
    color: "#666",
    fontSize: 10,
  },
});


