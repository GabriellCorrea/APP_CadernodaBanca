import React, { createContext, useContext, useState, ReactNode } from 'react';

export type LanguageCode = 'pt' | 'it';

export interface LanguageContextData {
  currentLanguage: LanguageCode;
  changeLanguage: (language: LanguageCode) => void;
  t: (key: string) => string; // Função de tradução
}

interface LanguageProviderProps {
  children: ReactNode;
}

// Dicionário de traduções
const translations = {
  pt: {
    // Header
    hello: 'Olá',
    // Tela inicial
    dailyGoal: 'Meta do dia',
    progress: 'Progresso',
    topSellers: 'Mais vendidos',
    start: 'Início',
    // Navegação
    home: 'Início',
    products: 'Produtos',
    cart: 'Carrinho',
    reports: 'Relatórios',
    profile: 'Perfil',
    // Dias da semana
    monday: 'segunda-feira',
    tuesday: 'terça-feira',
    wednesday: 'quarta-feira',
    thursday: 'quinta-feira',
    friday: 'sexta-feira',
    saturday: 'sábado',
    sunday: 'domingo',
    // Meses
    january: 'janeiro',
    february: 'fevereiro',
    march: 'março',
    april: 'abril',
    may: 'maio',
    june: 'junho',
    july: 'julho',
    august: 'agosto',
    september: 'setembro',
    october: 'outubro',
    november: 'novembro',
    december: 'dezembro',
  },
  it: {
    // Header
    hello: 'Ciao',
    // Tela inicial
    dailyGoal: 'Obiettivo del giorno',
    progress: 'Progresso',
    topSellers: 'Più venduti',
    start: 'Inizio',
    // Navegação
    home: 'Inizio',
    products: 'Prodotti',
    cart: 'Carrello',
    reports: 'Rapporti',
    profile: 'Profilo',
    // Dias da semana
    monday: 'lunedì',
    tuesday: 'martedì',
    wednesday: 'mercoledì',
    thursday: 'giovedì',
    friday: 'venerdì',
    saturday: 'sabato',
    sunday: 'domenica',
    // Meses
    january: 'gennaio',
    february: 'febbraio',
    march: 'marzo',
    april: 'aprile',
    may: 'maggio',
    june: 'giugno',
    july: 'luglio',
    august: 'agosto',
    september: 'settembre',
    october: 'ottobre',
    november: 'novembre',
    december: 'dicembre',
  },
};

const LanguageContext = createContext<LanguageContextData>({} as LanguageContextData);

export function LanguageProvider({ children }: LanguageProviderProps) {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageCode>('pt');

  const changeLanguage = (language: LanguageCode) => {
    setCurrentLanguage(language);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key as keyof typeof translations['pt']] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        changeLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextData {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }

  return context;
}