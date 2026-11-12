/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { AppSettingsProvider } from '#components/AppSettingsProvider.tsx';
import { createUseAppSettingsOrThrow } from '#hooks/createUseAppSettings.ts';

const settings = { Api: { Timeout: 5000 } };
const useAppSettingsOrThrow = createUseAppSettingsOrThrow<typeof settings>();

const createWrapper = ({ children }: PropsWithChildren) => (
  <AppSettingsProvider settings={settings}>{children}</AppSettingsProvider>
);

describe('useAppSettingsOrThrow', () => {
  it('When used within a provider, then it returns the requested object section', () => {
    // Arrange
    const path = 'Api';

    // Act
    const { result } = renderHook(() => useAppSettingsOrThrow(path), {
      wrapper: createWrapper,
    });

    // Assert
    expect(result.current).toEqual({ Timeout: 5000 });
  });

  it('When the requested section is missing, then it throws an error', () => {
    // Arrange
    const path = 'Missing';

    // Act & Assert
    expect(() =>
      // @ts-expect-error Intended for test
      renderHook(() => useAppSettingsOrThrow(path), {
        wrapper: createWrapper,
      }),
    ).toThrow('Setting "Missing" is undefined');
  });
});
