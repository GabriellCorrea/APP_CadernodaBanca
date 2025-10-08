import { Stack } from 'expo-router';
import { LanguageProvider } from '../contexts/LanguageContext';

export default function RootLayout() {
  return (
    <LanguageProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="home" />
        <Stack.Screen name="login" />
        <Stack.Screen name="vendas" />
        <Stack.Screen name="estoque" />
        <Stack.Screen name="devolucoes" />
        <Stack.Screen name="relatorios" />
      </Stack>
    </LanguageProvider>
  );
}