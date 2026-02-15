import { useReducer, useCallback, type Reducer } from 'react';

export function useLocalStorageReducer<S, A>(
  key: string,
  reducer: Reducer<S, A>,
  initialState: S,
): [S, React.Dispatch<A>] {
  const init = (defaultState: S): S => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (JSON.parse(stored) as S) : defaultState;
    } catch {
      return defaultState;
    }
  };

  const persistingReducer = useCallback(
    (state: S, action: A): S => {
      const newState = reducer(state, action);
      try {
        localStorage.setItem(key, JSON.stringify(newState));
      } catch (e) {
        console.error('Failed to persist state:', e);
      }
      return newState;
    },
    [key, reducer],
  );

  return useReducer(persistingReducer, initialState, init);
}
