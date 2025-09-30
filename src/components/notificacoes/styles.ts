// src/components/notificacoes/styles.ts
import { StyleSheet } from 'react-native';

export const estilos = StyleSheet.create({
  container: { 
    position: 'relative',
    zIndex: 1, // não precisa ser muito alto agora
  },

  icone: {
    marginRight: 15,
    marginTop: -20,
  },

  emblema: { 
    position: 'absolute', 
    top: -25, 
    right: 10, 
    backgroundColor: 'red', 
    borderRadius: 10, 
    width: 20, 
    height: 20, 
    justifyContent: 'center', 
    alignItems: 'center',
  },

  textoEmblema: { 
    color: 'white', 
    fontSize: 12, 
    fontWeight: 'bold',
  },

  // Fundo do modal (escuro transparente)
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },

  // Container do painel dentro do modal
  modalContainer: {
    marginTop: 200, // distância do topo (ajuste conforme header)
    alignSelf: 'center',
    width: 320,
  },

  painel: { 
    backgroundColor: 'white', 
    borderRadius: 8, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.25, 
    shadowRadius: 3.84, 
    elevation: 10,
    overflow: 'hidden',
  },

  cabecalhoPainel: { 
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12, 
    borderBottomWidth: 1, 
    borderBottomColor: '#eee', 
  },

  tituloPainel: { 
    fontWeight: 'bold', 
    fontSize: 16,
    color: '#333',
  },

  botaoFechar: {
    backgroundColor: '#FF3B30',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },

  textoBotaoFechar: {
    color: '#FFF',
    fontWeight: 'bold',
    fontSize: 14,
  },

  itemContainer: { 
    flexDirection: 'row', 
    padding: 10, 
    alignItems: 'center', 
    borderBottomWidth: 1, 
    borderBottomColor: '#f5f5f5',
  },

  itemImagem: { 
    width: 40, 
    height: 40, 
    borderRadius: 20, 
    marginRight: 10,
  },

  itemConteudo: { 
    flex: 1,
  },

  itemTexto: { 
    fontSize: 14, 
    color: '#333',
  },

  itemHorario: { 
    fontSize: 12, 
    color: '#888', 
    marginTop: 2,
  },
});
