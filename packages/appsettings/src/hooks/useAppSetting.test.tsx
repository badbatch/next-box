/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { AppSettingsProvider } from '../components/AppSettingsProvider.tsx';
import { useAppSetting } from './useAppSetting.ts';

const settings = { Api: { Missing: undefined, Timeout: 5000 } };

const createWrapper = ({ children }: { children: ReactNode }) => (
  <AppSettingsProvider settings={settings}>{children}</AppSettingsProvider>
);

describe('useAppSetting', () => {
  it('When used within a provider, then it returns the value at the requested leaf path', () => {
    // Arrange
    const path = 'Api.Timeout';

    // Act
    const { result } = renderHook(() => useAppSetting(path), { wrapper: createWrapper });

    // Assert
    expect(result.current).toBe(5000);
  });

  it('When the requested path is missing, then it returns undefined', () => {
    // Arrange
    const path = 'Api.Missing';

    // Act
    const { result } = renderHook(() => useAppSetting(path), { wrapper: createWrapper });

    // Assert
    expect(result.current).toBeUndefined();
  });
});
