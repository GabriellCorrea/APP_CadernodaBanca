import { createContext, ReactNode, useContext, useState } from 'react';

export type LanguageCode = 'pt' | 'it' | 'en';

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
    registerSale: 'Registrar Venda',
    editDailyGoal: 'Editar meta diária',
    
    // Navegação
    home: 'Início',
    stock: 'Estoque',
    salesPage: 'Vendas',
    returns: 'Chamadas',
    reports: 'Relatórios',
    calls: 'Chamadas',
    newCall: 'Nova Chamada',
    lastRegisteredCalls: 'Últimas Chamadas Registradas',
    
    // Páginas
    reportsAndInsights: 'Relatórios e Insights',
    management: 'Gestão',
    managementHistory: 'Histórico de Gestão',
    registerCallButton: 'Registrar\nChamada',
    registerReturnButton: 'Registrar\nDevolução',
    lastDeliveries: 'Últimas Entregas Registradas',
    lastReturns: 'Últimas Devoluções Registradas',
    loadingDeliveries: 'Carregando entregas...',
    
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
    processingFile: 'Processando arquivo',
    pleaseWaitSending: 'Por favor aguarde, enviando arquivo para o servidor...',
    elapsedTime: 'Tempo decorrido:',
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
    
    // Devolução
    newReturn: 'Nova Devolução',
    product: 'Produto:',
    productName: 'Nome do Produto',
    quantity: 'Quantidade:',
    returnReason: 'Motivo da Devolução:',
    describeReason: 'Descreva o motivo da devolução',
    registerReturn: 'Registrar Devolução',
    returnByFile: 'Devolução por Arquivo:',
    addFile: 'Adicionar Arquivo',
    lastRegisteredReturns: 'Últimas Devoluções Registradas',
    confirmFile: 'Confirmar Arquivo',
    cancel: 'Cancelar',
    confirm: 'Confirmar',
    fileUploadSuccess: 'Arquivo enviado com sucesso!',
    fileUploadError: 'Não foi possível enviar o arquivo. Tente novamente.',
    filePickError: 'Erro ao selecionar o arquivo.',
    
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
    salesLabel: 'Vendas',
    
    // Métodos de pagamento
    paymentMethodTitle: 'Método de Pagamento',
    paymentMethod: 'Selecione a forma de pagamento',
    paymentMethodLabel: 'Forma de pagamento',
    paymentWarning: 'Selecione a forma de pagamento antes de confirmar.',
    debit: 'Débito',
    credit: 'Crédito',
    pix: 'Pix',
    cash: 'Dinheiro',
    
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
    registerSale: 'Registra Vendita',
    editDailyGoal: 'Modifica obiettivo giornaliero',
    
    // Navegação
    home: 'Inizio',
    stock: 'Magazzino',
    salesPage: 'Vendite',
    returns: 'Resi',
    reports: 'Rapporti',
    calls: 'Chiamate',
    newCall: 'Nuova Chiamata',
    lastRegisteredCalls: 'Ultime Chiamate Registrate',
    
    // Páginas
    reportsAndInsights: 'Rapporti e Statistiche',
    management: 'Gestione',
    managementHistory: 'Cronologia Gestione',
    registerCallButton: 'Registra\nChiamata',
    registerReturnButton: 'Registra\nReso',
    lastDeliveries: 'Ultime Consegne Registrate',
    lastReturns: 'Ultimi Resi Registrati',
    loadingDeliveries: 'Caricamento consegne...',
    
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
    processingFile: 'Elaborazione file',
    pleaseWaitSending: 'Per favore attendi, invio del file al server...',
    elapsedTime: 'Tempo trascorso:',
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
    filePickError: 'Errore nella selezione del file.',
    
    // Mais vendidos
    loadingTopSellers: 'Caricamento più venduti...',
    
    // Relatórios
    salesToday: 'Vendite Oggi',
    products: 'Prodotti',
    weekSales: 'Vendite della settimana',
    averageTicket: 'Scontrino medio',
    sales: 'vendite',
    
    // Geral
    units: 'un.',
    qty: 'Qtà',
    salesLabel: 'Vendite',
    
    // Métodos de pagamento
    paymentMethodTitle: 'Metodo di Pagamento',
    paymentMethod: 'Seleziona il metodo di pagamento',
    paymentMethodLabel: 'Forma di pagamento',
    paymentWarning: 'Seleziona il metodo di pagamento prima di confermare.',
    debit: 'Debito',
    credit: 'Credito',
    pix: 'Pix',
    cash: 'Contanti',
    
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
  en: {
    // Header
    hello: 'Hello',
    
    // Tela inicial
    dailyGoal: 'Daily Goal',
    progress: 'Progress',
    topSellers: 'Top Sellers',
    start: 'Home',
    registerSale: 'Register Sale',
    editDailyGoal: 'Edit daily goal',
    
    // Navegação
    home: 'Home',
    stock: 'Stock',
    salesPage: 'Sales',
    returns: 'Returns',
    reports: 'Reports',
    calls: 'Calls',
    newCall: 'New Call',
    lastRegisteredCalls: 'Last Registered Calls',
    
    // Páginas
    reportsAndInsights: 'Reports and Analytics',
    management: 'Management',
    managementHistory: 'Management History',
    registerCallButton: 'Register\nCall',
    registerReturnButton: 'Register\nReturn',
    lastDeliveries: 'Last Registered Deliveries',
    lastReturns: 'Last Registered Returns',
    loadingDeliveries: 'Loading deliveries...',
    
    // Estoque
    searchMagazine: 'Search magazine...',
    filters: 'Filters',
    all: 'All',
    onDisplay: 'On Display',
    inStock: 'In Stock',
    loadingMagazines: 'Loading magazines...',
    noMagazineFound: 'No magazine found.',
    
    // Vendas
    cameraPermissionNeeded: 'We need camera permission',
    allow: 'Allow',
    scanBarcode: 'Scan a barcode',
    waiting: 'Waiting...',
    searchingProduct: 'Searching product...',
    confirmSale: 'Confirm sale',
    processing: 'Processing...',
    processingFile: 'Processing file',
    pleaseWaitSending: 'Please wait, sending file to server...',
    elapsedTime: 'Elapsed time:',
    newScan: 'New scan',
    code: 'Code',
    accessDenied: 'Access denied',
    loginRequired: 'You need to login to access the product scanner',
    ok: 'OK',
    error: 'Error',
    productNotFound: 'Product not found',
    authError: 'Authentication error. Please login again.',
    productNotRegistered: 'Product not registered in the system',
    serverError: 'Server error. Please try again.',
    scanProductFirst: 'Scan a product first',
    success: 'Success!',
    saleConfirmed: 'Sale confirmed successfully',
    saleError: 'Could not confirm the sale',
    
    // Chamadas
    newReturn: 'New Return',
    product: 'Product:',
    productName: 'Product Name',
    quantity: 'Quantity:',
    returnReason: 'Return Reason:',
    describeReason: 'Describe the return reason',
    registerReturn: 'Register Return',
    returnByFile: 'Return by File:',
    addFile: 'Add File',
    lastRegisteredReturns: 'Last Registered Returns',
    confirmFile: 'Confirm File',
    cancel: 'Cancel',
    confirm: 'Confirm',
    fileUploadSuccess: 'File uploaded successfully!',
    fileUploadError: 'Could not upload file. Please try again.',
    filePickError: 'Error selecting file.',
    
    // Mais vendidos
    loadingTopSellers: 'Loading top sellers...',
    
    // Relatórios
    salesToday: 'Sales Today',
    products: 'Products',
    weekSales: 'Week Sales',
    averageTicket: 'Average Ticket',
    sales: 'sales',
    
    // Geral
    units: 'un.',
    qty: 'Qty',
    salesLabel: 'Sales',
    
    // Métodos de pagamento
    paymentMethodTitle: 'Payment Method',
    paymentMethod: 'Select payment method',
    paymentMethodLabel: 'Payment method',
    paymentWarning: 'Select payment method before confirming.',
    debit: 'Debit',
    credit: 'Credit',
    pix: 'Pix',
    cash: 'Cash',
    
    // Dias da semana
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday',
    saturday: 'Saturday',
    sunday: 'Sunday',
    
    // Abreviações dos dias da semana
    monAbbr: 'Mon',
    tueAbbr: 'Tue',
    wedAbbr: 'Wed',
    thuAbbr: 'Thu',
    friAbbr: 'Fri',
    satAbbr: 'Sat',
    sunAbbr: 'Sun',
    
    // Meses
    january: 'January',
    february: 'February',
    march: 'March',
    april: 'April',
    may: 'May',
    june: 'June',
    july: 'July',
    august: 'August',
    september: 'September',
    october: 'October',
    november: 'November',
    december: 'December',
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