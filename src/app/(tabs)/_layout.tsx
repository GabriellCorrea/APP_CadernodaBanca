import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useLanguage } from '@/contexts/LanguageContext';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof MaterialCommunityIcons>['name'];
  color: string;
}) {
  return <MaterialCommunityIcons size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#E67E22',
        tabBarInactiveTintColor: '#FFFFFF',
        tabBarStyle: {
          backgroundColor: '#4E5356',
          height: 70 + insets.bottom, // esse insets adiciona um espaço extra embaixo para dispositivos com "notch"
          paddingBottom: insets.bottom > 0 ? insets.bottom : 10,
          paddingTop: 5,
          borderTopWidth: 0,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
      }}>
      <Tabs.Screen
        name="home"
        options={{
          title: t('home'),
          tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
        }}
      />
      <Tabs.Screen
        name="estoque"
        options={{
          title: t('stock'),
          tabBarIcon: ({ color }) => <TabBarIcon name="cube-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="vendas"
        options={{
          title: t('salesPage'),
          tabBarIcon: ({ color }) => <TabBarIcon name="cart-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="gestao"
        options={{
          title: t('returns'),
          tabBarIcon: ({ color }) => <TabBarIcon name="undo-variant" color={color} />,
        }}
      />
      <Tabs.Screen
        name="relatorios"
        options={{
          title: t('reports'),
          tabBarIcon: ({ color }) => <TabBarIcon name="chart-bar" color={color} />,
        }}
      />

      {/* Telas ocultas */}
      <Tabs.Screen name="entradas" options={{ href: null }} />
      <Tabs.Screen name="entradas/[id]" options={{ href: null }} />
      <Tabs.Screen name="devolucoes" options={{ href: null }} />
      <Tabs.Screen name="devolucoes/[id]" options={{ href: null }} />
    </Tabs>
  );
}
