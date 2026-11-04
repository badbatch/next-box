/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { render, renderHook, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { ErrorBoundary } from '../__testUtils__/components/ErrorBoundary.tsx';
import { AppSettingsProvider } from '../components/AppSettingsProvider.tsx';
import { useAppSettingsContext } from './useAppSettingsContext.ts';

describe('useAppSettingsContext', () => {
  it('When used within a provider, then it returns the settings context instance', () => {
    // Arrange
    const settings = { Api: { Timeout: 5000 } };

    const wrapper = ({ children }: { children: ReactNode }) => (
      <AppSettingsProvider settings={settings}>{children}</AppSettingsProvider>
    );

    // Act
    const { result } = renderHook(() => useAppSettingsContext(), { wrapper });

    // Assert
    expect(result.current.get('Api.Timeout')).toBe(5000);
  });

  it('When used outside a provider, then it throws a descriptive error', () => {
    // Arrange
    const ContextReader = () => {
      useAppSettingsContext();
      // Required for React typing
      // eslint-disable-next-line unicorn/no-null
      return null;
    };

    // Act
    render(
      <ErrorBoundary>
        <ContextReader />
      </ErrorBoundary>,
    );

    // Assert
    expect(screen.getByText('useAppSettingsContext must be used within an <AppSettingsProvider>.')).toBeTruthy();
  });
});
