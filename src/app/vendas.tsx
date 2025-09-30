import { useState, useEffect } from "react"
import { CameraView, CameraType, useCameraPermissions } from "expo-camera"
import { View, StyleSheet, Pressable, Text } from "react-native"
import { SafeAreaView } from "react-native-safe-area-context"
import { Header } from "@/components/header"
import { BottomNav } from "@/components/barra_navegacao"

export default function Vendas() {
  const [facing, setFacing] = useState<CameraType>("back") // câmera traseira por padrão
  const [codigoBarras, setCodigoBarras] = useState<string | null>(null)
  const [permission, requestPermission] = useCameraPermissions()

  // enquanto não tiver permissão
  if (!permission) {
    return <View />
  }

  if (!permission.granted) {
    return (
      <SafeAreaView style={styles.wrapper}>
        <View style={styles.container}>
          <Text style={{ textAlign: "center" }}>
            Precisamos da permissão para usar a câmera
          </Text>
          <Pressable onPress={requestPermission} style={styles.botao}>
            <Text style={styles.botaoTexto}>Permitir</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      {/* Header */}
      <Header
        usuario="Andreas"
        pagina="Início"
      />

      {/* Card central */}
      <View style={styles.container}>
        <View style={styles.card}>
          {/* Espaço da foto (agora câmera) */}
          <CameraView
            style={styles.fotoBox}
            facing={facing}
            barcodeScannerSettings={{
              barcodeTypes: ['code128', 'ean13', 'ean8', 'qr'],
            }}
            onBarcodeScanned={(result) => {
              if (result.data) {
                setCodigoBarras(result.data)
                console.log("Código de barras lido:", result.data)
                // Aqui você pode adicionar lógica para buscar o produto pelo código de barras (usando o endpoint "/revistas/buscar/codigo-barras?q={código}" )
                // e atualizar a interface conforme necessário
                // se encontrar um produto com o código lido, deu tudo certo
              }
            }}
          />

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
    </SafeAreaView>
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
  },
  card: {
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    minHeight: 450,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
    elevation: 6,
  },
  fotoBox: {
    width: "80%",
    height: 320,
    borderRadius: 12,
    overflow: "hidden", // importante para cortar a câmera no formato arredondado
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
    backgroundColor: "#1A2E40",
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