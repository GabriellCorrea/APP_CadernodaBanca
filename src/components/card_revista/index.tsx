import { useLanguage } from "@/contexts/LanguageContext";
import { Image, Text, View, TouchableOpacity } from "react-native"; // Importado TouchableOpacity
import { styles } from "./styles";

type CardRevistaProps = {
  imagem: any; // Alterado de string para 'any' para aceitar {uri:...}, require() ou null
  titulo: string;
  preco: number;
  vendas: number;
  estoque: number;
  onPress?: () => void; // Prop opcional para o clique
};

export function CardRevista({
  imagem,
  titulo,
  preco,
  vendas,
  estoque,
  onPress, // Recebe a prop
}: CardRevistaProps) {
  const { t } = useLanguage();

  return (
    // Envolvido o card com TouchableOpacity
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      disabled={!onPress} // Desabilitado se nenhuma função for passada
      activeOpacity={0.8}
    >
      <Image
            source={
              // Lógica atualizada para usar o placeholder se 'imagem' for nula ou indefinida
              imagem
                ? (typeof imagem === "string" ? { uri: imagem } : imagem) // Aceita string (URL antiga) ou objeto {uri} (nova API)
                : require("../../../assets/images/imagem-placeholder.png") // Fallback
            }
            style={styles.imagem}
          />
      <View style={styles.info}>
        <Text style={styles.titulo} numberOfLines={3}>
          {titulo}
        </Text>

        <Text style={styles.preco}>R$ {preco.toFixed(2)}</Text>
        <Text style={styles.textoCinza}>{t('salesLabel')}: {vendas}</Text>
        <Text style={styles.textoCinza}>{estoque} {t('units')}</Text>
      </View>
    </TouchableOpacity>
  );
}