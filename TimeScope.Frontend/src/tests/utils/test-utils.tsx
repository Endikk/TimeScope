/**
 * Test utilities
 * Custom render functions and test helpers
 */

import { ReactElement } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';

/**
 * Custom render function that includes all necessary providers
 */
export function renderWithProviders(
  ui: ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Mock user data for tests
 */
export const mockUser = {
  userId: 1,
  username: 'testuser',
  email: 'test@example.com',
  role: 'User',
  firstName: 'Test',
  lastName: 'User',
};

/**
 * Mock admin user data for tests
 */
export const mockAdminUser = {
  userId: 2,
  username: 'admin',
  email: 'admin@example.com',
  role: 'Admin',
  firstName: 'Admin',
  lastName: 'User',
};

/**
 * Mock tokens for tests
 */
export const mockTokens = {
  token: 'mock-jwt-token',
  refreshToken: 'mock-refresh-token',
};

// Re-export everything from testing library
// eslint-disable-next-line react-refresh/only-export-components
export * from '@testing-library/react';
export { renderWithProviders as render };
