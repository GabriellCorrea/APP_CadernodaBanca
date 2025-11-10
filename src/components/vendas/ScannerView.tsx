import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ProdutoEstoque } from "../../app/(tabs)/vendas";

const getFriendlyErrorMessage = (
  err: any,
  t: (key: string, fallback?: string) => string
): string => {
  if (err.code === "ERR_NETWORK") {
    return t("errorNetwork", "Erro de conexão. Verifique sua internet.");
  }
  if (err.response?.status >= 500) {
    return t("errorServer", "Erro no servidor. Tente novamente mais tarde.");
  }
  return err.message || t("saleError", "Ocorreu um erro ao carregar os dados.");
};

type ScannerViewProps = {
 onScanSuccess: (produto: ProdutoEstoque) => void;
 onScanFail: (barcode: string) => void;
 apiOnline: boolean;
 isPaused: boolean; // <-- NOVA PROP
};


export function ScannerView({ onScanSuccess, onScanFail, apiOnline, isPaused }: ScannerViewProps) {
  const { t } = useLanguage();
  const [facing, setFacing] = useState<CameraType>("back");
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false); // Estado interno
  const [error, setError] = useState<string | null>(null);
  const [lastScannedCode, setLastScannedCode] = useState<string | null>(null);
  const [lastScanTime, setLastScanTime] = useState<number>(0);
  const [permission, requestPermission] = useCameraPermissions();

  const handleClearError = () => {
    setError(null);
    setScanned(false);
    setLastScannedCode(null);
    setLoading(false);
  }

  const buscarProduto = async (codigo: string) => {
    const agora = Date.now();
    if (agora - lastScanTime < 2000) return;
    if (loading || codigo === lastScannedCode || error) return;
    
    const codigoLimpo = codigo.trim();
    if (
      !codigoLimpo || 
      codigoLimpo.length < 8 || 
      codigoLimpo.length > 18 ||
      !/^\d+$/.test(codigoLimpo)
    ) {
      return; 
    }

    setLastScanTime(agora);
    setScanned(true);
    setLoading(true);
    setError(null);
    setLastScannedCode(codigoLimpo);

    try {
      const data = await apiService.revistas.buscarPorCodigoBarras(codigoLimpo);

      if (!data) throw { response: { status: 404 } };
      const produtoEncontrado = data["data"] || data;

      if (!produtoEncontrado || !produtoEncontrado.id_revista) {
        throw { response: { status: 404 } };
      }

      onScanSuccess(produtoEncontrado);
      
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404 || status === 500) {
        onScanFail(codigoLimpo);
      } else {
        const friendlyMessage = getFriendlyErrorMessage(error, t);
        setError(friendlyMessage);
      }
    } finally {
      setLoading(false);
      // Reseta o scanner após 2s, se não for pausado
      setTimeout(() => {
        setScanned(false);
        setLastScannedCode(null);
      }, 2000); 
    }
  };

  if (!permission) return <View style={styles.container}><ActivityIndicator color="#E67E22" /></View>;

  if (!permission.granted) {
    return (
      <View style={styles.container}>
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
    // O View raiz agora tem flex: 1 para preencher o card
    <View style={styles.container}> 
      <CameraView
        style={styles.camera}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["code128", "ean13", "ean8", "qr"],
        }}
        // "Desliga" o scanner se estiver pausado, carregando, ou com erro
        onBarcodeScanned={isPaused || loading || error ? undefined : (result) => {
          if (result.data) buscarProduto(result.data);
        }}
      />
      
      {/* UI de Status (Loading) */}
      {loading && (
        <View style={styles.statusOverlay}>
          <ActivityIndicator size="large" color="#E67E22" />
          <Text style={styles.statusTexto}>{t("searchingProduct")}</Text>
        </View>
      )}

      {/* UI de Status (Error) */}
      {error && !loading && (
        <View style={[styles.statusOverlay, styles.errorBox]}>
          <Text style={[styles.statusTexto, styles.errorText]}>{error}</Text>
          <TouchableOpacity
            style={[styles.botao, styles.retryButtonScanner]}
            onPress={handleClearError}
          >
            <Text style={styles.botaoTexto}>Tentar Novamente</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* UI de Status (Waiting) */}
      {!loading && !error && (
        <View style={styles.statusInfoBottom}>
          <Text style={styles.statusTexto}>
            {isPaused ? t("waiting") : t("scanBarcode")}
          </Text>
        </View>
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1, // <--- OCUPA O ESPAÇO DO CARD
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 12, // <--- ADICIONADO
    overflow: "hidden", // <--- ADICIONADO
    backgroundColor: '#000',
  },
  camera: {
    ...StyleSheet.absoluteFillObject, // <--- PREENCHE O CONTAINER
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
  retryButtonScanner: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "600",
    fontSize: 14,
  },
  // Overlay para Loading e Erro (centralizado)
  statusOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 20,
  },
  // View para "Aguardando" (embaixo)
  statusInfoBottom: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 15,
    backgroundColor: "rgba(248, 249, 250, 0.9)",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  statusTexto: {
    fontSize: 16, // Aumentado
    color: "#333",
    textAlign: "center",
    fontWeight: "500",
  },
  errorBox: {
    backgroundColor: 'rgba(253, 236, 234, 0.95)',
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
});