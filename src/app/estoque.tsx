import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, Feather } from "@expo/vector-icons";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/barra_navegacao";
import { CardRevista } from "@/components/card_revista";

const produtos = [
  {
    id: 1,
    titulo: "Vogue Michael Jackson",
    preco: 5000,
    vendas: 140,
    estoque: 150,
    imagem:
      "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UF1000,1000_QL80_.jpg",
  },
  {
    id: 2,
    titulo: "Complex Lana del Rey",
    preco: 5000,
    vendas: 140,
    estoque: 100,
    imagem:
      "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UF1000,1000_QL80_.jpg",
  },
];

export default function Estoque() {
  const [filtro, setFiltro] = useState("Todos");
  const [busca, setBusca] = useState("");

  const filtros = ["Todos", "À mostra", "Em estoque"];

  const contagemFiltros: Record<string, number> = {
    Todos: produtos.length,
    "À mostra": produtos.filter((p) => p.estoque <= 10).length,
    "Em estoque": produtos.filter((p) => p.estoque > 0).length,
  };

  const produtosFiltrados = produtos
    .filter((p) => {
      if (filtro === "Todos") return true;
      if (filtro === "À mostra") return p.estoque <= 10;
      if (filtro === "Em estoque") return p.estoque > 0;
      return true;
    })
    .filter((p) => p.titulo.toLowerCase().includes(busca.toLowerCase()));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <Header
        usuario="Andreas"
        data="Segunda, 08 de Setembro."
        pagina="Estoque"
      />

      {/* Conteúdo */}
      <View style={styles.container}>
        {/* Busca */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.input}
            placeholder="Buscar"
            placeholderTextColor="#666"
            value={busca}
            onChangeText={setBusca}
          />
        </View>

        {/* Título Filtros */}
        <View style={styles.filtrosTitulo}>
          <Feather name="filter" size={16} color="#1E2A38" />
          <Text style={styles.filtrosTexto}>Filtros</Text>
        </View>

        {/* Botões de Filtro */}
        <View style={styles.filtros}>
          {filtros.map((f) => (
            <TouchableOpacity
              key={f}
              style={[styles.filtroButton, filtro === f && styles.filtroAtivo]}
              onPress={() => setFiltro(f)}
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtro === f && { color: "#34495E" },
                ]}
              >
                {f} ({contagemFiltros[f]})
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Lista de produtos */}
        <ScrollView
          contentContainerStyle={styles.produtos}
          showsVerticalScrollIndicator={false}
        >
          {produtosFiltrados.map((p) => (
            <CardRevista
              key={p.id}
              imagem={p.imagem}
              titulo={p.titulo}
              preco={p.preco}
              vendas={p.vendas}
              estoque={p.estoque}
            />
          ))}
        </ScrollView>
      </View>

      {/* Barra fixa no rodapé */}
      <View style={styles.bottomNavContainer}>
        <BottomNav />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f8f8f8", // fundo padrão
  },
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    marginBottom: 20,
    height: 42,
  },
  searchIcon: {
    marginRight: 6,
  },
  input: {
    flex: 1,
    color: "#434343",
  },
  filtrosTitulo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  filtrosTexto: {
    fontSize: 14,
    color: "#34495E",
    marginLeft: 6,
  },
  filtros: {
    flexDirection: "row",
    marginBottom: 20,
  },
  filtroButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: "#ddd",
    marginRight: 8,
  },
  filtroAtivo: {
    backgroundColor: "rgba(230, 126, 34, 0.5)",
  },
  filtroTexto: {
    color: "#34495E",
  },
  produtos: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    paddingBottom: 120,
  },
  bottomNavContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
});


