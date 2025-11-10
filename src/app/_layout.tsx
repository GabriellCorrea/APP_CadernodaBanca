import { Stack } from 'expo-router';
import { LogBox } from 'react-native';
import { LanguageProvider } from '../contexts/LanguageContext';

LogBox.ignoreAllLogs(); // Ignora todos os logs de aviso

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        {/* A tela de login, na raiz do app */}
        <Stack.Screen name="index" />

        {/* O grupo "(tabs)" que contém todas as telas principais do app */}
        <Stack.Screen name="(tabs)" />
      </Stack>
    </LanguageProvider>
  );
}