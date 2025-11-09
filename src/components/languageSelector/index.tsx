import { Image } from "expo-image";
import { useState } from "react";
import { Modal, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { useLanguage } from "../../contexts/LanguageContext";
import { styles } from "./styles";

type Language = {
  code: 'pt' | 'it' | 'en';
  name: string;
  flag?: any; // Para require() de imagens
  emoji?: string; // Para emojis de bandeira
};

const languages: Language[] = [
  {
    code: 'pt',
    name: 'Português',
    flag: require("../../../assets/images/Flag_of_Brazil.svg.png")
  },
  {
    code: 'it',
    name: 'Italiano',
    flag: require("../../../assets/images/bandeira-italia.png")
  },
  {
    code: 'en',
    name: 'English',
    flag: require("../../../assets/images/bandeira-eua.png")
  }
];

export function LanguageSelector() {
  const [modalVisible, setModalVisible] = useState(false);
  const { t, currentLanguage, changeLanguage } = useLanguage();

  const selectedLanguage = languages.find(lang => lang.code === currentLanguage) || languages[0];

  const handleLanguageSelect = (languageCode: 'pt' | 'it' | 'en') => {
    changeLanguage(languageCode);
    setModalVisible(false);
  };

  return (
    <View>
      {/* Botão principal */}
      <TouchableOpacity
        style={styles.selectorButton}
        onPress={() => setModalVisible(true)}
      >
        {selectedLanguage.flag ? (
          <Image
            source={selectedLanguage.flag}
            style={styles.flagImage}
          />
        ) : (
          <Text style={styles.flagEmoji}>{selectedLanguage.emoji}</Text>
        )}
        <Icon name="chevron-down" size={16} color="#666" />
      </TouchableOpacity>

      {/* Modal de seleção */}
      <Modal
        animationType="fade"
        presentationStyle="overFullScreen"   // iOS: garante que o modal fique por cima da tela inteira
        statusBarTranslucent={true}         // Android: permite cobrir a status bar
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectLang')}</Text>

            {languages.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageOption,
                  currentLanguage === language.code && styles.selectedOption
                ]}
                onPress={() => handleLanguageSelect(language.code)}
              >
                {language.flag ? (
                  <Image
                    source={language.flag}
                    style={styles.optionFlag}
                  />
                ) : (
                  <Text style={styles.optionEmoji}>{language.emoji}</Text>
                )}
                <Text style={[
                  styles.languageName,
                  currentLanguage === language.code && styles.selectedText
                ]}>
                  {language.name}
                </Text>
                {currentLanguage === language.code && (
                  <Icon name="check" size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}