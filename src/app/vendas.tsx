import { View, StyleSheet, Pressable, Text } from "react-native"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/barra_navegacao"

export default function Vendas() {
  return (
    <View style={styles.wrapper}>
      {/* Header */}
      <Header usuario="Andreas" data="Segunda, 08 de Setembro." pagina="Vendas" />

      {/* Card central */}
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Espaço da foto */}
          <View style={styles.fotoBox} />

          {/* Botão */}
          <Pressable
            style={({ pressed }) => [
              styles.botao,
              pressed && styles.botaoPressionado,
            ]}
          >
            {({ pressed }) => (
              <Text
                style={[
                  styles.botaoTexto,
                  pressed && styles.botaoTextoPressionado,
                ]}
              >
                Confirmar venda
              </Text>
            )}
          </Pressable>
        </View>
      </View>

      {/* Bottom nav */}
      <BottomNav />
    </View>
  )
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 16,
    paddingTop: 100, // espaço pro header
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minHeight: 450, // mais alto
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6, // sombra no Android
  },
  fotoBox: {
    width: "80%",
    height: 320,
    borderRadius: 12,
    backgroundColor: "#EDEDED",
    marginVertical: 24,
  },
  botao: {
    backgroundColor: "#B1BCBF",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    width: "60%",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  botaoPressionado: {
    backgroundColor: "#1A2E40", // azul escuro
  },
  botaoTexto: {
    color: "#34495E",
    fontWeight: "600",
    fontSize: 16,
  },
  botaoTextoPressionado: {
    color: "#FFF",
  },
})


