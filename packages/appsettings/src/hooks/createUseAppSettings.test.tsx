/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { AppSettingsProvider } from '../components/AppSettingsProvider.tsx';
import { createUseAppSettings } from './createUseAppSettings.ts';

const settings = { Api: { Timeout: 5000 } };
const useAppSettings = createUseAppSettings<typeof settings>();

const createWrapper = ({ children }: PropsWithChildren) => (
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
    // @ts-expect-error Intended for test
    const { result } = renderHook(() => useAppSettings(path), { wrapper: createWrapper });

    // Assert
    expect(result.current).toBeUndefined();
  });
});
