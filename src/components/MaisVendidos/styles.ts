import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 8, // <-- Apenas descomentei esta linha
  },
  row: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    width: '48.5%',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardImage: {
    width: 60,
    height: 80,
    borderRadius: 4,
    marginRight: 8,
    resizeMode: 'cover',
  },
  cardTextContainer: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  cardPrice: {
    fontSize: 11,
    color: '#333',
    marginVertical: 4,
  },
  cardSales: {
    fontSize: 10,
    color: '#7F8C8D',
  },
});