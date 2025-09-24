import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: "#4E5356",
  },
  container: {
    bottom: -1,
    left: 0,
    right: 0,
    flexDirection: "row",
    backgroundColor: "#4E5356",
    justifyContent: "space-evenly",
    alignItems: "center",
    height: 70,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
    paddingHorizontal: 8,
  },

  button: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },

  innerButton: {
    flexDirection: "row",
    alignItems: "center",
  },

  activeButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 25,
    paddingVertical: 13,
    paddingHorizontal: 10,
    minWidth: 110,
    justifyContent: "center",
  },

  activeText: {
    marginLeft: 8,
    color: "#E67E22",
    fontSize: 15,
    fontWeight: "600",
    flexShrink: 1,
  },

  iconActive: {
    color: "#E67E22",
  },

  iconInactive: {
    color: "#E67E22",
  },
});


