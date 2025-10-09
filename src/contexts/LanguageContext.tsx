import { createContext, ReactNode, useContext, useState } from 'react';

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
    registerSale: '+ Registrar Venda',
    
    // Navegação
    home: 'Início',
    stock: 'Estoque',
    salesPage: 'Vendas',
    returns: 'Chamadas',
    reports: 'Relatórios',
    
    // Páginas
    reportsAndInsights: 'Relatórios e Insights',
    
    // Estoque
    searchMagazine: 'Buscar revista...',
    filters: 'Filtros',
    all: 'Todos',
    onDisplay: 'À mostra',
    inStock: 'Em estoque',
    loadingMagazines: 'Carregando revistas...',
    noMagazineFound: 'Nenhuma revista encontrada.',
    
    // Vendas
    cameraPermissionNeeded: 'Precisamos da permissão para usar a câmera',
    allow: 'Permitir',
    scanBarcode: 'Escaneie um código de barras',
    waiting: 'Aguardando...',
    searchingProduct: 'Buscando produto...',
    confirmSale: 'Confirmar venda',
    processing: 'Processando...',
    newScan: 'Novo scan',
    code: 'Código',
    accessDenied: 'Acesso negado',
    loginRequired: 'Você precisa fazer login para acessar o scanner de produtos',
    ok: 'OK',
    error: 'Erro',
    productNotFound: 'Produto não encontrado',
    authError: 'Erro de autenticação. Faça login novamente.',
    productNotRegistered: 'Produto não cadastrado no sistema',
    serverError: 'Erro no servidor. Tente novamente.',
    scanProductFirst: 'Escaneie um produto primeiro',
    success: 'Sucesso!',
    saleConfirmed: 'Venda confirmada com sucesso',
    saleError: 'Não foi possível confirmar a venda',
    
    // Chamadas
    newReturn: 'Nova Chamada',
    product: 'Produto:',
    productName: 'Nome do Produto',
    quantity: 'Quantidade:',
    returnReason: 'Motivo da Chamada:',
    describeReason: 'Descreva o motivo da chamada',
    registerReturn: 'Registrar Chamada',
    returnByFile: 'Chamada por Arquivo:',
    addFile: 'Adicionar Arquivo',
    lastRegisteredReturns: 'Últimas Chamadas Registradas',
    confirmFile: 'Confirmar Arquivo',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    fileUploadSuccess: 'Arquivo enviado com sucesso!',
    fileUploadError: 'Não foi possível enviar o arquivo. Tente novamente.',
    
    // Mais vendidos
    loadingTopSellers: 'Carregando mais vendidos...',
    
    // Relatórios
    salesToday: 'Vendas Hoje',
    products: 'Produtos',
    weekSales: 'Vendas da semana',
    averageTicket: 'Ticket médio',
    sales: 'vendas',
    
    // Geral
    units: 'un.',
    qty: 'Qtd',
    
    // Dias da semana
    monday: 'segunda-feira',
    tuesday: 'terça-feira',
    wednesday: 'quarta-feira',
    thursday: 'quinta-feira',
    friday: 'sexta-feira',
    saturday: 'sábado',
    sunday: 'domingo',
    
    // Abreviações dos dias da semana
    monAbbr: 'seg',
    tueAbbr: 'ter',
    wedAbbr: 'qua',
    thuAbbr: 'qui',
    friAbbr: 'sex',
    satAbbr: 'sab',
    sunAbbr: 'dom',
    
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
    registerSale: '+ Registra Vendita',
    
    // Navegação
    home: 'Inizio',
    stock: 'Magazzino',
    salesPage: 'Vendite',
    returns: 'Resi',
    reports: 'Rapporti',
    
    // Páginas
    reportsAndInsights: 'Rapporti e Approfondimenti',
    
    // Estoque
    searchMagazine: 'Cerca rivista...',
    filters: 'Filtri',
    all: 'Tutti',
    onDisplay: 'In mostra',
    inStock: 'In magazzino',
    loadingMagazines: 'Caricamento riviste...',
    noMagazineFound: 'Nessuna rivista trovata.',
    
    // Vendas
    cameraPermissionNeeded: 'Abbiamo bisogno del permesso per usare la fotocamera',
    allow: 'Consenti',
    scanBarcode: 'Scansiona un codice a barre',
    waiting: 'In attesa...',
    searchingProduct: 'Ricerca prodotto...',
    confirmSale: 'Conferma vendita',
    processing: 'Elaborazione...',
    newScan: 'Nuova scansione',
    code: 'Codice',
    accessDenied: 'Accesso negato',
    loginRequired: 'Devi effettuare il login per accedere al scanner prodotti',
    ok: 'OK',
    error: 'Errore',
    productNotFound: 'Prodotto non trovato',
    authError: 'Errore di autenticazione. Effettua di nuovo il login.',
    productNotRegistered: 'Prodotto non registrato nel sistema',
    serverError: 'Errore del server. Riprova.',
    scanProductFirst: 'Scansiona prima un prodotto',
    success: 'Successo!',
    saleConfirmed: 'Vendita confermata con successo',
    saleError: 'Non è stato possibile confermare la vendita',
    
    // Chamadas
    newReturn: 'Nuovo Reso',
    product: 'Prodotto:',
    productName: 'Nome del Prodotto',
    quantity: 'Quantità:',
    returnReason: 'Motivo del Reso:',
    describeReason: 'Descrivi il motivo del reso',
    registerReturn: 'Registra Reso',
    returnByFile: 'Reso tramite File:',
    addFile: 'Aggiungi File',
    lastRegisteredReturns: 'Ultimi Resi Registrati',
    confirmFile: 'Conferma File',
    cancel: 'Annulla',
    confirm: 'Conferma',
    fileUploadSuccess: 'File caricato con successo!',
    fileUploadError: 'Non è stato possibile caricare il file. Riprova.',
    
    // Mais vendidos
    loadingTopSellers: 'Caricamento più venduti...',
    
    // Relatórios
    salesToday: 'Vendite Oggi',
    products: 'Prodotti',
    weekSales: 'Vendite della settimana',
    averageTicket: 'Scontrino medio',
    sales: 'vendite',
    
    // Geral
    units: 'pz.',
    qty: 'Qtà',
    
    // Dias da semana
    monday: 'lunedì',
    tuesday: 'martedì',
    wednesday: 'mercoledì',
    thursday: 'giovedì',
    friday: 'venerdì',
    saturday: 'sabato',
    sunday: 'domenica',
    
    // Abreviações dos dias da semana
    monAbbr: 'lun',
    tueAbbr: 'mar',
    wedAbbr: 'mer',
    thuAbbr: 'gio',
    friAbbr: 'ven',
    satAbbr: 'sab',
    sunAbbr: 'dom',
    
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