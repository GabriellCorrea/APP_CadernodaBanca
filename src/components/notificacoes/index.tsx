// src/components/notificacoes/index.tsx
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Modal } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { Image } from 'expo-image';
import { estilos } from './styles';

const notificacoes = [
  {
    id: 1,
    usuario: 'Sistema',
    imagemUsuario: 'https://cdn-icons-png.flaticon.com/512/1828/1828884.png', // ícone genérico de estoque
    acao: 'A revista "Veja" está com estoque baixo (apenas 3 unidades).',
    horario: 'há 2 minutos',
  },
  {
    id: 2,
    usuario: 'Sistema',
    imagemUsuario: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png', // ícone de vendas
    acao: 'Você vendeu 5 unidades da revista "Superinteressante".',
    horario: 'há 10 minutos',
  },
  {
    id: 3,
    usuario: 'Sistema',
    imagemUsuario: 'https://cdn-icons-png.flaticon.com/512/679/679720.png', // ícone de chegada de produto
    acao: 'Chegou nova remessa da revista "Quatro Rodas".',
    horario: 'há 30 minutos',
  },
];


export function Notificacoes() {
  const [estaAberto, setEstaAberto] = useState(false);
  const totalDeNotificacoes = notificacoes.length;

  return (
    <View style={estilos.container}>
      <TouchableOpacity onPress={() => setEstaAberto(true)}>
        <Icon name="bell-outline" size={28} color="#4E5356" style={estilos.icone} />
        {totalDeNotificacoes > 0 && (
          <View style={estilos.emblema}>
            <Text style={estilos.textoEmblema}>{totalDeNotificacoes}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal
        visible={estaAberto}
        transparent
        animationType="fade"
        onRequestClose={() => setEstaAberto(false)}
      >
        <View style={estilos.modalOverlay}>
          <View style={estilos.modalContainer}>
            <View style={estilos.painel}>
              {/* Cabeçalho com título e botão fechar */}
              <View style={estilos.cabecalhoPainel}>
                <Text style={estilos.tituloPainel}>Notificações</Text>
                <TouchableOpacity
                  onPress={() => setEstaAberto(false)}
                  style={estilos.botaoFechar}
                >
                  <Text style={estilos.textoBotaoFechar}>Fechar</Text>
                </TouchableOpacity>
              </View>

              {/* Lista de notificações */}
              <ScrollView>
                {notificacoes.map((item) => (
                  <View key={item.id} style={estilos.itemContainer}>
                    <Image source={{ uri: item.imagemUsuario }} style={estilos.itemImagem} />
                    <View style={estilos.itemConteudo}>
                      <Text style={estilos.itemTexto}>
                        <Text style={{ fontWeight: 'bold' }}>{item.usuario}</Text> {item.acao}
                      </Text>
                      <Text style={estilos.itemHorario}>{item.horario}</Text>
                    </View>
                  </View>
                ))}
              </ScrollView>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
