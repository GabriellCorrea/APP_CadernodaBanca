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
        <Stack.Screen name="relatorios" />

        <Stack.Screen name="gestao" />
        <Stack.Screen name="entradas" />
        <Stack.Screen name="entradas/[id]" />
        <Stack.Screen name="devolucoes" />
        <Stack.Screen name="devolucoes/[id]" />
      </Stack>
    </LanguageProvider>
  );
}