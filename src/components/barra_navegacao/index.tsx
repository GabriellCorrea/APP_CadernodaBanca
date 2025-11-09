import { usePathname, useRouter } from "expo-router";
import { Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Icon from "react-native-vector-icons/MaterialCommunityIcons";
import { styles } from "./styles";
import { useLanguage } from "@/contexts/LanguageContext";

export function BottomNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { t } = useLanguage();

  const tabs = [
    { name: t("home"), route: "/home", icon: "home" },
    { name: t("stock"), route: "/estoque", icon: "cube-outline" },
    { name: t("salesPage"), route: "/vendas", icon: "cart-outline" },
    { name: t("returns"), route: "/gestao", icon: "undo-variant" },
    { name: t("reports"), route: "/relatorios", icon: "chart-bar" },
  ];

return (
  <>
    {/* Barra fixa no fundo */}
    <View style={styles.container}>
      {tabs.map((tab, index) => {
        const isActive = pathname === tab.route;
        return (
          <TouchableOpacity
            key={index}
            style={styles.button}
            onPress={() => router.push(tab.route as any)}
          >
            <View
              style={[styles.innerButton, isActive && styles.activeButton]}
            >
              <Icon
                name={tab.icon}
                size={24}
                color={
                  isActive
                    ? styles.iconActive.color
                    : styles.iconInactive.color
                }
              />
              {isActive && (
                <Text style={styles.activeText} numberOfLines={1}>
                  {tab.name}
                </Text>
              )}
            </View>
          </TouchableOpacity>
        );
      })}
    </View>

    {/* SafeArea atrás da barra */}
    <SafeAreaView edges={["bottom"]} style={styles.safeArea} />
  </>
);
}




