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

        {/* --- ROTAS DE GESTÃO ATUALIZADAS --- */}
        <Stack.Screen name="gestao" />
        <Stack.Screen name="entradas" />
        <Stack.Screen name="devolucoes" />
        <Stack.Screen name="devolucoes/[id]" />

        {/* As rotas abaixo foram substituídas:
          <Stack.Screen name="devolucoes" />  (agora é 'devolucoes')
          <Stack.Screen name="chamadas" />     (agora é 'entradas')
          <Stack.Screen name="historico_gestao" /> (lógica movida para 'entradas' e 'devolucoes')
        */}
      </Stack>
    </LanguageProvider>
  );
}