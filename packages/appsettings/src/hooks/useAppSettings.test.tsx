/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { AppSettingsProvider } from '../components/AppSettingsProvider.tsx';
import { useAppSettings } from './useAppSettings.ts';

const settings = { Api: { Timeout: 5000 } };

const createWrapper = ({ children }: { children: ReactNode }) => (
  <AppSettingsProvider settings={settings}>{children}</AppSettingsProvider>
);

describe('useAppSettings', () => {
  it('When used within a provider, then it returns the requested object section', () => {
    // Arrange
    const path = 'Api';

    // Act
    const { result } = renderHook(() => useAppSettings(path), { wrapper: createWrapper });

    // Assert
    expect(result.current).toEqual({ Timeout: 5000 });
  });

  it('When the requested section is missing, then it returns undefined', () => {
    // Arrange
    const path = 'Missing';

    // Act
    const { result } = renderHook(() => useAppSettings(path), { wrapper: createWrapper });

    // Assert
    expect(result.current).toBeUndefined();
  });
});
