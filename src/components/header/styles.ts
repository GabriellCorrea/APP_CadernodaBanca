import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  header: {
    backgroundColor: "white",
    height: 60,
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    zIndex: 1000,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#FFFFFF",
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

  container2: {
    backgroundColor: "#555",
    height: 40,
    alignItems: "center",
    position: "absolute",
    top: 60,
    left: 0,
    right: 0,
    flexDirection: "row",
    paddingLeft: 20,
    zIndex: 1000,
    elevation: 10,
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
    position: "absolute",
    top: 100,
    left: 0,
    right: 0,
    paddingLeft: 20,

    // Sombra iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,

    // Sombra Android
    elevation: 10,

    zIndex: 1000,
  },


  pagina: {
    color: "#34495E",
    fontSize: 19,
    fontWeight: "700",
  },
});

