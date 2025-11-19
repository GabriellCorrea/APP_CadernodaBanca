import { useLanguage } from "@/contexts/LanguageContext";
import { useData } from "@/contexts/DataContext"; // <--- ADICIONADO
import { apiService } from "@/services/api";
import React, { useMemo, useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  // IMPORTAR Platform e ScrollView para melhorias
  Platform,
  ScrollView,
} from "react-native";
import { ProdutoEstoque } from "../../app/(tabs)/vendas";

type ConfirmarVendaViewProps = {
  produto: ProdutoEstoque;
  onCancelar: () => void;
  apiOnline: boolean;
  setApiOnline: (status: boolean) => void;
};

// --- NOVA FUNÇÃO HELPER ---
// Para formatar a moeda de forma consistente
const formatCurrency = (value: number | null | undefined): string => {
  if (value === null || value === undefined || isNaN(value)) return "R$ 0,00";
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
// --- FIM DA NOVA FUNÇÃO ---

export function ConfirmarVendaView({
  produto,
  onCancelar,
  apiOnline,
  setApiOnline,
}: ConfirmarVendaViewProps) {
  const { t } = useLanguage();
  const { refreshData } = useData(); // <--- ADICIONADO
  const [quantidade, setQuantidade] = useState("1");
  const [desconto, setDesconto] = useState("0"); // Este estado agora é apenas para o *display*
  const [metodoPagamento, setMetodoPagamento] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // --- LÓGICA DE CÁLCULO ATUALIZADA ---
  // Obtém o valor numérico limpo do desconto
  const descontoNum = useMemo(() => {
    // Substitui vírgula por ponto para o parseFloat
    const valorLimpo = desconto.replace(",", ".");
    return parseFloat(valorLimpo) || 0;
  }, [desconto]);
  
  const precoUnitarioNum = useMemo(() => {
     return parseFloat((produto.preco_capa || 0).toString());
  }, [produto.preco_capa]);

  const valorTotal = useMemo(() => {
    const qtd = parseInt(quantidade) || 0;
    // Usar os valores numéricos já calculados
    return Math.max(0, precoUnitarioNum * qtd - descontoNum);
  }, [precoUnitarioNum, quantidade, descontoNum]);
  // --- FIM DA LÓGICA DE CÁLCULO ---


  const handleConfirmarVenda = async () => {
    if (!metodoPagamento) {
      Alert.alert(t("error"), "Por favor, selecione um método de pagamento.");
      return;
    }
    const qtdNum = parseInt(quantidade);
    if (isNaN(qtdNum) || qtdNum <= 0) {
      Alert.alert(t("error"), "Quantidade deve ser um número maior que zero.");
      return;
    }
    
    // Usar o valor numérico já limpo
    if (isNaN(descontoNum) || descontoNum < 0) {
      Alert.alert(t("error"), "Desconto inválido. Use 0 se não houver desconto.");
      return;
    }
    if (valorTotal < 0) {
      Alert.alert(
        t("error"),
        "Valor total não pode ser negativo. Verifique o desconto."
      );
      return;
    }

    setLoading(true);

    const payload = {
      id_revista: produto.id_revista,
      metodo_pagamento: metodoPagamento,
      qtd_vendida: qtdNum,
      desconto_aplicado: descontoNum, // Envia o número limpo
      valor_total: valorTotal,
      data_venda: new Date().toISOString(),
    };

    try {
      await apiService.vendas.cadastrarPorId(payload);
      setApiOnline(true);
      
      refreshData(); // <--- ADICIONADO

      Alert.alert(t("success"), t("saleConfirmed"), [
        { text: t("ok"), onPress: onCancelar },
      ]);
    } catch (error: any) {
      console.error("❌ Erro detalhado na venda:", {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
      });

      let mensagemErro = t("saleError");
      if (error.response?.status === 422) {
        const details = error.response?.data?.detail
        if (Array.isArray(details) && details[0]?.msg) {
          const field = details[0].loc?.[1] || "desconhecido"
          mensagemErro = `Dados inválidos: ${details[0].msg} (Campo: ${field})`
        } else {
          mensagemErro = `Dados inválidos (422). Verifique o payload enviado.`
        }
      } else if (!error.response) {
        mensagemErro = "Sem conexão com a internet.";
        setApiOnline(false);
      } else if (error.response.data["detail"]) {
        mensagemErro = `Erro: ${error.response.data["detail"]}`
      }

      Alert.alert(t("error"), mensagemErro, [
        { text: "Cancelar", style: "cancel" },
      ]);
    } finally {
      setLoading(false);
    }
  };


  // --- ATUALIZAÇÃO DE INPUT DE DESCONTO ---
  const handleDescontoChange = (text: string) => {
    // 1. Remove qualquer coisa que não seja número, vírgula ou ponto
    let valorFiltrado = text.replace(/[^0-9,.]/g, '');

    // 2. Impede múltiplos separadores (vírgula ou ponto)
    const separadores = valorFiltrado.match(/[.,]/g) || [];
    
    // --- INÍCIO DA CORREÇÃO ---
    // Pegamos o primeiro separador fora do 'if'
    const primeiroSeparador = separadores[0]; // Isso é 'string | undefined'

    // Verificamos o 'length' E se o 'primeiroSeparador' realmente existe
    if (separadores.length > 1 && primeiroSeparador) {
      // Agora o TypeScript sabe que 'primeiroSeparador' é uma 'string'
      const primeiroSeparadorIndex = valorFiltrado.indexOf(primeiroSeparador);
      const inicio = valorFiltrado.substring(0, primeiroSeparadorIndex + 1);
      const fim = valorFiltrado.substring(primeiroSeparadorIndex + 1).replace(/[.,]/g, '');
      valorFiltrado = inicio + fim;
    }
    // --- FIM DA CORREÇÃO ---
    
    // 3. Se começar com , ou . adiciona um 0 antes
    if (valorFiltrado.startsWith(',') || valorFiltrado.startsWith('.')) {
      valorFiltrado = '0' + valorFiltrado;
    }

    setDesconto(valorFiltrado);
  };
  // --- FIM DA ATUALIZAÇÃO ---


  return (
    // Adicionado ScrollView para garantir que funcione em telas pequenas
    <ScrollView 
      style={styles.confirmationContainer} 
      contentContainerStyle={{ paddingBottom: 20 }}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.confirmTitle}>{t("confirmSale")}</Text>

      <View style={styles.produtoInfo}>
        <Text style={styles.produtoNome}>{produto.nome}</Text>
        <Text style={styles.produtoPreco}>
          {/* Usando o formatador de moeda */}
          Preço Unitário: {formatCurrency(precoUnitarioNum)}
        </Text>
        {produto.codigo_barras && (
          <Text style={styles.codigoBarras}>{t('code')}: {produto.codigo_barras}</Text>
        )}
      </View>

      <View style={styles.inputRow}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Quantidade</Text>
          <TextInput
            style={styles.input}
            value={quantidade}
            onChangeText={setQuantidade}
            keyboardType="numeric"
            selectTextOnFocus
          />
        </View>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Desconto (R$)</Text>
          <TextInput
            style={styles.input}
            value={desconto}
            // --- ATUALIZADO AQUI ---
            onChangeText={handleDescontoChange}
            // --- FIM DA ATUALIZAÇÃO ---
            keyboardType="decimal-pad"
            selectTextOnFocus
          />
        </View>
      </View>

      <Text style={styles.label}>Método de Pagamento</Text>
      <View style={styles.paymentOptionsRow}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            metodoPagamento === "Débito" && styles.paymentOptionSelected,
            { backgroundColor: "#E8F6EA" },
          ]}
          onPress={() => setMetodoPagamento("Débito")}
        >
          <Text style={[styles.paymentOptionText, { color: "#2E7D32" }]}>
            {t("debit")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            metodoPagamento === "Crédito" && styles.paymentOptionSelected,
            { backgroundColor: "#FDECEA" },
          ]}
          onPress={() => setMetodoPagamento("Crédito")}
        >
          <Text style={[styles.paymentOptionText, { color: "#C62828" }]}>
            {t("credit")}
          </Text>
        </TouchableOpacity>
      </View>
      <View style={styles.paymentOptionsRow}>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            metodoPagamento === "Pix" && styles.paymentOptionSelected,
          ]}
          onPress={() => setMetodoPagamento("Pix")}
        >
          <Text style={[styles.paymentOptionText, { color: "#000" }]}>
            {t("pix")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.paymentOption,
            metodoPagamento === "Dinheiro" && styles.paymentOptionSelected,
          ]}
          onPress={() => setMetodoPagamento("Dinheiro")}
        >
          <Text style={[styles.paymentOptionText, { color: "#000" }]}>
            {t("cash")}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.totalContainer}>
        <Text style={styles.totalLabel}>Valor Total:</Text>
        <Text style={styles.totalValor}>
          {/* Usando o formatador de moeda */}
          {formatCurrency(valorTotal)}
        </Text>
      </View>

      <View style={[styles.botoesContainer, { marginTop: 20 }]}>
        <TouchableOpacity
          style={[styles.botaoAcao, styles.botaoCancelar]}
          onPress={onCancelar}
          disabled={loading}
        >
          <Text style={styles.botaoCancelarTexto}>Cancelar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoAcao,
            styles.fixedRegistrarVendaBtn,
            (loading || !metodoPagamento) && styles.botaoDisabled,
          ]}
          onPress={handleConfirmarVenda}
          disabled={loading || !metodoPagamento}
        >
          <Text style={styles.fixedRegistrarVendaBtnText}>
            {loading ? t("processing") : t("confirmSale")}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView> // Fechamento do ScrollView
  );
}

// Estilos específicos do ConfirmarVendaView
const styles = StyleSheet.create({
  confirmationContainer: {
    flex: 1, // Garante que o scrollview tente ocupar espaço
    width: '100%',
    padding: 4,
  },
  confirmTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    marginBottom: 16,
  },
  produtoInfo: {
    alignItems: "center",
    marginBottom: 16,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    width: "100%",
    borderWidth: 1,
    borderColor: '#eee'
  },
  produtoNome: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    textAlign: "center",
  },
  produtoPreco: {
    fontSize: 15,
    fontWeight: "500",
    color: "#111",
    marginTop: 5,
  },
  codigoBarras: {
    fontSize: 12,
    color: "#666",
    marginTop: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#555',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  inputGroup: {
    flex: 1,
  },
  paymentOptionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    width: '100%',
    gap: 10,
  },
  paymentOption: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  paymentOptionSelected: {
    borderWidth: 2,
    borderColor: "#333",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  paymentOptionText: {
    fontSize: 15,
    fontWeight: '600'
  },
  totalContainer: {
    marginTop: 16,
    padding: 16,
    backgroundColor: '#E8F6EA',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#b2dfdb',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#004d40',
  },
  totalValor: {
    fontSize: 22,
    fontWeight: '800',
    color: '#004d40',
    marginTop: 4,
  },
  botoesContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginTop: 10,
    flexShrink: 1,
  },
  botaoAcao: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  botaoCancelar: {
    backgroundColor: "#f1f1f1",
    borderColor: "#ddd",
  },
  botaoCancelarTexto: {
    color: "#555",
    fontWeight: "600",
    fontSize: 14,
  },
  fixedRegistrarVendaBtn: {
    backgroundColor: "#FF9800",
  },
  fixedRegistrarVendaBtnText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 14,
  },
  botaoDisabled: {
    backgroundColor: "#ccc",
    borderColor: "#bbb",
    opacity: 0.7,
  },
});