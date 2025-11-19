import React, { createContext, ReactNode, useContext, useState } from 'react';

// 1. Definir o que o contexto fornece
export interface DataContextData {
  dataVersion: number;
  refreshData: () => void;
}

interface DataProviderProps {
  children: ReactNode;
}

// 2. Criar o contexto
const DataContext = createContext<DataContextData>({} as DataContextData);

// 3. Criar o Provedor
export function DataProvider({ children }: DataProviderProps) {
  const [dataVersion, setDataVersion] = useState(0);

  const refreshData = () => {
    setDataVersion(v => v + 1); // Incrementa a versão
  };

  return (
    <DataContext.Provider
      value={{
        dataVersion,
        refreshData,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

// 4. Criar o Hook customizado para usar o contexto
export function useData(): DataContextData {
  const context = useContext(DataContext);

  if (!context) {
    throw new Error('useData deve ser usado dentro de um DataProvider');
  }

  return context;
}