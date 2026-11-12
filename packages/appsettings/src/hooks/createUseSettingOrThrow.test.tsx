/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { type PropsWithChildren } from 'react';
import { AppSettingsProvider } from '#components/AppSettingsProvider.tsx';
import { createUseSettingOrThrow } from '#hooks/createUseSetting.ts';

const settings = { Api: { Timeout: 5000 } };
const useSettingOrThrow = createUseSettingOrThrow<typeof settings>();

const createWrapper = ({ children }: PropsWithChildren) => (
  <AppSettingsProvider settings={settings}>{children}</AppSettingsProvider>
);

describe('useSettingOrThrow', () => {
  it('When used within a provider, then it returns the requested setting', () => {
    // Arrange
    const path = 'Api.Timeout';

    // Act
    const { result } = renderHook(() => useSettingOrThrow(path), {
      wrapper: createWrapper,
    });

    // Assert
    expect(result.current).toBe(5000);
  });

  it('When the requested setting is missing, then it throws an error', () => {
    // Arrange
    const path = 'Api.Missing';

    // Act & Assert
    expect(() =>
      // @ts-expect-error Intended for test
      renderHook(() => useSettingOrThrow(path), {
        wrapper: createWrapper,
      }),
    ).toThrow('Setting "Api.Missing" is undefined');
  });
});
