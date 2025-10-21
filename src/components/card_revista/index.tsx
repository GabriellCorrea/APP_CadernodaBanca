import { useLanguage } from "@/contexts/LanguageContext";
import { Image, Text, View } from "react-native";
import { styles } from "./styles";

type CardRevistaProps = {
  imagem: string;
  titulo: string;
  preco: number;
  vendas: number;
  estoque: number;
};

export function CardRevista({
  imagem,
  titulo,
  preco,
  vendas,
  estoque,
}: CardRevistaProps) {
  const { t } = useLanguage();
  
  return (
    <View style={styles.card}>
      <Image
            source={
              typeof imagem === "string"
                ? { uri: imagem }
                : imagem
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
    </View>
  );
}






