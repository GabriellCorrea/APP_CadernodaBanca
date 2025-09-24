import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#fff",
  },

  header: {
    backgroundColor: "white",
    height: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#EEE",
  },

  image_caderno: {
    marginBottom: 20,
    width: 40,
    height: 140,
  },

  image_flag: {
    marginBottom: 20,
    width: 40,
    height: 40,
    resizeMode: "contain",
  },

  saudacao: {
    color: "#4E5356",
    fontSize: 20,
    fontWeight: "600",
    flex: 1,
    marginLeft: 10,
    marginTop: -10
  },

  container2: {
    backgroundColor: "#555",
    height: 40,
    alignItems: "center",
    flexDirection: "row",
    paddingLeft: 20,
    elevation: 6,
  },

  data: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },

  container3: {
    backgroundColor: "#D9D9D9",
    height: 40,
    justifyContent: "center",
    alignItems: "flex-start",
    paddingLeft: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 6,
  },

  pagina: {
    color: "#34495E",
    fontSize: 19,
    fontWeight: "700",
  },
});
