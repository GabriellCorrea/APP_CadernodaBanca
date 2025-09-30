import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Header } from "@/components/header";
import { BottomNav } from "@/components/barra_navegacao";
import { CardRevista } from "@/components/card_revista";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";

export default function Devolucoes() {
  const [produto, setProduto] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [motivo, setMotivo] = useState("");
  const [arquivoSelecionado, setArquivoSelecionado] = useState<any>(null);
  const [showModal, setShowModal] = useState(false);

  const devolucoes = [
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
    {
      id: 3,
      titulo: "Bravo 10 anos",
      preco: 3000,
      vendas: 120,
      estoque: 80,
      imagem:
        "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UF1000,1000_QL80_.jpg",
    },
    {
      id: 4,
      titulo: "Criativa Esporte",
      preco: 2500,
      vendas: 100,
      estoque: 90,
      imagem:
        "https://m.media-amazon.com/images/I/81vpsIs58WL._AC_UF1000,1000_QL80_.jpg",
    },
  ];

  function handleRegistrar() {
    console.log("Devolução registrada:", produto, quantidade, motivo);
    setProduto("");
    setQuantidade("");
    setMotivo("");
  }

  async function handlePickDocument() {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: "*/*",
        copyToCacheDirectory: true,
      });

      if (result.canceled) {
        console.log("Usuário cancelou a seleção");
        return;
      }

      const file = result.assets[0];
      setArquivoSelecionado(file);
      setShowModal(true); // abre modal de confirmação
    } catch (err) {
      console.error("Erro ao selecionar arquivo:", err);
    }
  }

  function confirmarArquivo() {
    console.log("Arquivo confirmado:", arquivoSelecionado);
    setShowModal(false);
    // Aqui você pode enviar o arquivo para backend ou salvar
  }

  return (
    <SafeAreaView style={styles.wrapper} edges={["top", "left", "right"]}>
      {/* Header fixo */}
      <Header
        usuario="Andreas"
        pagina="Devolução"
      />

      {/* Conteúdo rolável */}
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Título Nova Devolução */}
        <View style={styles.tituloLinha}>
          <Ionicons name="refresh-circle-outline" size={22} color="#333" />
          <Text style={styles.titulo}>Nova Devolução</Text>
        </View>

        {/* Formulário */}
        <View style={styles.card}>
          <Text style={styles.label}>Produto:</Text>
          <TextInput
            style={styles.input}
            value={produto}
            onChangeText={setProduto}
            placeholder="Nome do Produto"
            placeholderTextColor="#434343"
          />

          <Text style={styles.label}>Quantidade:</Text>
          <TextInput
            style={styles.input}
            value={quantidade}
            onChangeText={setQuantidade}
            placeholder="0"
            keyboardType="numeric"
            placeholderTextColor="#434343"
          />

          <Text style={styles.label}>Motivo da Devolução:</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={motivo}
            onChangeText={setMotivo}
            placeholder="Descreva o motivo da devolução"
            multiline
            placeholderTextColor="#434343"
          />

          {/* Botão Registrar */}
          <TouchableOpacity style={styles.botao} onPress={handleRegistrar}>
            <Ionicons name="refresh-circle-outline" size={20} color="#FFF" />
            <Text style={styles.botaoTexto}>Registrar Devolução</Text>
          </TouchableOpacity>

          <Text style={styles.label}>Devolução por Arquivo:</Text>

          {/* Botão de adicionar arquivo */}
          <TouchableOpacity style={styles.botaoArquivo} onPress={handlePickDocument}>
            <Ionicons name="document-attach-outline" size={20} color="#FFF" />
            <Text style={styles.textoArquivo}>Adicionar Arquivo</Text>
          </TouchableOpacity>
        </View>

        {/* Últimas devoluções */}
        <View style={styles.tituloLinha}>
          <Ionicons name="time-outline" size={22} color="#34495E" />
          <Text style={[styles.titulo, { marginTop: 0 }]}>
            Últimas Devoluções Registradas
          </Text>
        </View>

        {/* Grid de 2 colunas */}
        <View style={styles.grid}>
          {devolucoes.map((p) => (
            <View style={styles.cardContainer} key={p.id}>
              <CardRevista
                imagem={p.imagem}
                titulo={p.titulo}
                preco={p.preco}
                vendas={p.vendas}
                estoque={p.estoque}
              />
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Modal de Confirmação */}
      <Modal transparent visible={showModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Ionicons name="document-attach-outline" size={40} color="#34495E" />
            <Text style={styles.modalTitulo}>Confirmar Arquivo</Text>
            {arquivoSelecionado && (
              <Text style={styles.modalTexto}>{arquivoSelecionado.name}</Text>
            )}

            <View style={styles.modalBotoes}>
              <TouchableOpacity
                style={[styles.modalBotao, { backgroundColor: "#ccc" }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={styles.modalBotaoTexto}>Cancelar</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBotao, { backgroundColor: "#E53935" }]}
                onPress={confirmarArquivo}
              >
                <Text style={styles.modalBotaoTexto}>Confirmar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barra inferior */}
      <BottomNav />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  tituloLinha: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    marginTop: 20,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
    color: "#34495E",
  },
  card: {
    backgroundColor: "#B1BCBF",
    padding: 16,
    borderRadius: 12,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    marginTop: 10,
    color: "#34495E",
  },
  input: {
    borderWidth: 1,
    borderColor: "rgba(146, 138, 138, 0.5)",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
    color: "#434343",
  },
  botaoArquivo: {
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 12,
    flexDirection: "row",
    borderWidth: 0.5,
    borderColor: "#FFF",
  },
  textoArquivo: {
    marginLeft: 8,
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  botao: {
    backgroundColor: "#E53935",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 16,
    borderWidth: 0.5,
    borderColor: "#FFF",
    flexDirection: "row",
  },
  botaoTexto: {
    color: "#FFF",
    fontWeight: "bold",
    fontSize: 16,
    marginLeft: 8,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cardContainer: {
    width: "48%",
    marginBottom: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
  },
  modalTitulo: {
    fontSize: 18,
    fontWeight: "600",
    marginVertical: 10,
    color: "#34495E",
  },
  modalTexto: {
    fontSize: 14,
    color: "#555",
    marginBottom: 20,
    textAlign: "center",
  },
  modalBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBotao: {
    flex: 1,
    padding: 12,
    marginHorizontal: 6,
    borderRadius: 8,
    alignItems: "center",
  },
  modalBotaoTexto: {
    color: "#FFF",
    fontWeight: "600",
  },
});



