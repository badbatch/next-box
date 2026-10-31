/** @jest-environment @repodog/jest-config/FailOnJsdomConsoleEnvironment.mjs */

import { describe, expect, it } from '@jest/globals';
import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { EnvsProvider } from './EnvsProvider.tsx';
import { useEnvs } from './useEnvs.ts';

describe('useEnvs', () => {
  it('When used within a provider, then it returns the environment variables and getter from context', () => {
    // Arrange
    const envs = { NEXT_PUBLIC_LANGUAGE_CODE: 'en' };

    const wrapper = ({ children }: { children: ReactNode }) => <EnvsProvider envs={envs}>{children}</EnvsProvider>;

    // Act
    const { result } = renderHook(() => useEnvs(), { wrapper });

    // Assert
    expect(result.current.envs).toEqual(envs);
    expect(result.current.getEnv('NEXT_PUBLIC_LANGUAGE_CODE')).toBe('en');
    expect(result.current.getEnv('MISSING')).toBeUndefined();
  });

  it('When used without a provider, then it returns the default environment context', () => {
    // Arrange
    const expectedContext = { envs: {}, getEnv: expect.any(Function) };

    // Act
    const { result } = renderHook(() => useEnvs());

    // Assert
    expect(result.current).toEqual(expectedContext);
    expect(result.current.getEnv('MISSING')).toBe('');
  });
});
