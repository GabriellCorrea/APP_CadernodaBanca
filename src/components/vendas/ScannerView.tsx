import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  StyleSheet,
  Text,
  View
} from "react-native";
import { ProdutoEstoque } from "../../app/vendas"; 

type ScannerViewProps = {
  onProdutoSelecionado: (produto: ProdutoEstoque) => void;
  apiOnline: boolean;
};

export function ScannerView({ onProdutoSelecionado, apiOnline }: ScannerViewProps) {
  const { t } = useLanguage();
  const [facing, setFacing] = useState<CameraType>("back");
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [permission, requestPermission] = useCameraPermissions();

  const buscarProduto = async (codigo: string) => {
    const agora = Date.now();
    if (agora - lastScanTime < 2000) return; // Throttle
    if (scanned || loading || codigo === lastScannedCode) return;
    if (!codigo || typeof codigo !== "string") return;
    const codigoLimpo = codigo.trim();
    if (codigoLimpo.includes("://") || codigoLimpo.includes("exp://")) return;
    if (codigoLimpo.length < 8 || codigoLimpo.length > 18) return;
    console.log("🔍 Código escaneado:", codigoLimpo);
    if (!/^\d+$/.test(codigoLimpo)) return;

    setLastScanTime(agora);
    setScanned(true);
    setLoading(true);
    setLastScannedCode(codigoLimpo);

    try {
      const data = await apiService.revistas.buscarPorCodigoBarras(codigoLimpo);

      if (!data) throw { response: { status: 404 } };
      const produtoEncontrado = data["data"] || data;

      if (!produtoEncontrado || !produtoEncontrado.id_revista) {
        console.error("Produto encontrado sem ID de revista", produtoEncontrado);
        throw { response: { status: 404 }, message: t("productNotRegistered") };
      }

      onProdutoSelecionado(produtoEncontrado);

      setTimeout(() => setScanned(false), 1000);
    } catch (error: any) {
      console.error("❌ Erro na busca de produto:", { error });
      let mensagem = error.message || t("productNotFound");
      if (error.response?.status === 404) mensagem = t("productNotRegistered");

      Alert.alert(t("error"), mensagem, [
        {
          text: "Cancelar",
          style: "cancel" as const,
          onPress: () => {
            setScanned(false);
            setLastScannedCode(null);
          },
        },
      ]);
      setTimeout(() => {
        setScanned(false);
        setLastScannedCode(null);
      }, 5000);
    } finally {
      setLoading(false);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={{ textAlign: "center", padding: 20 }}>
          {t("cameraPermissionNeeded")}
        </Text>
        <Pressable onPress={requestPermission} style={styles.botao}>
          <Text style={styles.botaoTexto}>{t("allow")}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <>
      <CameraView
        style={styles.fotoBox}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["code128", "ean13", "ean8", "qr"],
        }}
        onBarcodeScanned={(result) => {
          if (result.data) buscarProduto(result.data);
        }}
      />
      {!loading && (
        <View style={styles.statusInfo}>
          <Text style={styles.statusTexto}>
            {scanned ? t("waiting") : t("scanBarcode")}
          </Text>
        </View>
      )}
      {loading && (
        <View style={styles.statusInfo}>
          <ActivityIndicator size="large" color="#E67E22" />
          <Text style={styles.statusTexto}>{t("searchingProduct")}</Text>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  permissionContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  fotoBox: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 0,
  },
  botao: {
    backgroundColor: "#E67E22",
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 6,
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  statusInfo: {
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    width: "100%",
    minHeight: 100,
    borderLeftWidth: 4,
    borderLeftColor: "#E67E22",
  },
  statusTexto: {
    fontSize: 14,
    color: "#6c757d",
    textAlign: "center",
    marginTop: 8,
    fontWeight: "500",
  },
});