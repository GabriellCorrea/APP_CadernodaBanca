import { useLanguage } from "@/contexts/LanguageContext";
import { apiService } from "@/services/api";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { ProdutoEstoque } from "../../app/vendas";

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
};


export function ScannerView({ onScanSuccess, onScanFail, apiOnline }: ScannerViewProps) {
  const { t } = useLanguage();
  const [facing, setFacing] = useState<CameraType>("back");
  const [loading, setLoading] = useState(false);
  const [scanned, setScanned] = useState(false);
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
    // Throttle: não processa mais de 1 scan a cada 2 segundos
    if (agora - lastScanTime < 2000) return;
    // Não processa se já estiver a carregar, se for o mesmo código, ou se houver um erro ativo
    if (loading || codigo === lastScannedCode || error) return;
    const codigoLimpo = codigo.trim();
   if (
      !codigoLimpo || 
      codigoLimpo.length < 8 || 
      codigoLimpo.length > 18 ||
      !/^\d+$/.test(codigoLimpo) // Verifica se é 100% numérico
    ) {
      // console.log(`Código ignorado (não passou nos filtros): ${codigoLimpo}`);
      return; 
    }

    // console.log("Código escaneado:", codigoLimpo);

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
      
      setTimeout(() => setScanned(false), 1000);
    } catch (error: any) {
      const status = error.response?.status;
      if (status === 404 || status === 500) {
        // console.warn(`Código não encontrado (status: ${status}). Chamando onScanFail.`);
        onScanFail(codigoLimpo);
      } else {
        // console.error("❌ Erro na busca de produto:", { error });
        // const friendlyMessage = getFriendlyErrorMessage(error, t);
        // setError(friendlyMessage);
      }

    } finally {
      setLoading(false);
      setTimeout(() => {
        setScanned(false);
        setLastScannedCode(null);
      }, 2000); 
    }
  };

  if (!permission) return <View />;

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
    <>
      <CameraView
        style={styles.fotoBox}
        facing={facing}
        barcodeScannerSettings={{
          barcodeTypes: ["code128", "ean13", "ean8", "qr"],
        }}
        onBarcodeScanned={(result) => {
          if (result.data && !error) buscarProduto(result.data);
        }}
      />
      {loading && (
        <View style={styles.statusInfo}>
          <ActivityIndicator size="large" color="#E67E22" />
          <Text style={styles.statusTexto}>{t("searchingProduct")}</Text>
        </View>
      )}

      {error &&  !loading && (
        <View style={[styles.statusInfo, styles.errorBox]}>
          <Text style={[styles.statusTexto, styles.errorText]}>{error}</Text>
          <TouchableOpacity
            style={[styles.botao, styles.retryButtonScanner]}
            onPress={handleClearError}
          >
            <Text style={styles.botaoTexto}>{t("tryAgain")}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <View style={styles.statusInfo}>
          <Text style={styles.statusTexto}>
            {scanned ? t("waiting") : t("scanBarcode")}
          </Text>
        </View>
      )}
    </>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  fotoBox: {
    width: "100%",
    aspectRatio: 1, 
    borderRadius: 12,
    overflow: "hidden",
    marginVertical: 0,
    backgroundColor: '#000', 
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
     marginTop: 8, // Corrigido (removido o 'image')
    fontWeight: "500",
  },
  errorBox: {
    borderLeftColor: "#D32F2F",
    backgroundColor: "#FDECEA",
  },
  errorText: {
    color: '#D32F2F',
    textAlign: 'center',
    fontSize: 16,
    marginBottom: 10,
  },
});