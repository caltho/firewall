import { createContext, useContext } from 'react';
import { useLocalStorageReducer } from '../hooks/useLocalStorageReducer';
import { appReducer, initialState, type AppState, type AppAction } from './appReducer';

interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useLocalStorageReducer(
    'firewall-app-state',
    appReducer,
    initialState,
  );

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return ctx;
}
