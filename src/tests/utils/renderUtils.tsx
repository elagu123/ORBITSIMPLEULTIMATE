import React, { ReactElement } from 'react';
import { render, RenderOptions, RenderResult } from '@testing-library/react';
import { CombinedProvider } from '../../store/optimized/CombinedProvider';

// =============================================================================
// CUSTOM RENDER FUNCTIONS
// =============================================================================

/**
 * Custom render function that includes all providers
 */
const AllProviders: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <CombinedProvider>
      {children}
    </CombinedProvider>
  );
};

/**
 * Render with all app providers
 */
export const renderWithProviders = (
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
): RenderResult => {
  return render(ui, { wrapper: AllProviders, ...options });
};

/**
 * Render without providers (for testing isolated components)
 */
export const renderWithoutProviders = (
  ui: ReactElement,
  options?: RenderOptions
): RenderResult => {
  return render(ui, options);
};