import { useMemo, useCallback } from 'react';

/**
 * Hook for creating memoized context values to prevent unnecessary re-renders
 */
export const useMemoizedContext = <T>(
  value: T, 
  dependencies: any[]
): T => {
  return useMemo(() => value, dependencies);
};

/**
 * Hook for creating stable callback references
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  dependencies: any[]
): T => {
  return useCallback(callback, dependencies);
};

/**
 * Hook for creating memoized context value with actions
 */
export const useMemoizedContextWithActions = <TState, TActions>(
  state: TState,
  actions: TActions,
  stateDeps: any[] = [],
  actionDeps: any[] = []
) => {
  const memoizedState = useMemo(() => state, stateDeps);
  const memoizedActions = useMemo(() => actions, actionDeps);
  
  return useMemo(
    () => ({ ...memoizedState, ...memoizedActions }),
    [memoizedState, memoizedActions]
  );
};