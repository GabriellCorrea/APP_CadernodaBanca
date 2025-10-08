import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  selectorButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },

  flagImage: {
    width: 24,
    height: 18,
    borderRadius: 2,
    marginRight: 4,
  },

  flagEmoji: {
    fontSize: 18,
    marginRight: 4,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    minWidth: 250,
    maxWidth: 300,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: '#333',
  },

  languageOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginVertical: 2,
  },

  selectedOption: {
    backgroundColor: '#F0F8FF',
  },

  optionFlag: {
    width: 30,
    height: 22,
    borderRadius: 3,
    marginRight: 12,
  },

  optionEmoji: {
    fontSize: 22,
    marginRight: 12,
    width: 30,
    textAlign: 'center',
  },

  languageName: {
    fontSize: 16,
    flex: 1,
    color: '#333',
  },

  selectedText: {
    color: '#007AFF',
    fontWeight: '600',
  },
});