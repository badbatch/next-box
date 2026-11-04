import { describe, expect, it } from '@jest/globals';
import { getPublicEnvs } from './getPublicEnvs.ts';

describe('getPublicEnvs', () => {
  it('When environment variables are public, then it returns them with NODE_ENV and whitelisted values', () => {
    // Arrange
    const env = {
      EMPTY_PUBLIC: '',
      NEXT_PUBLIC_LANGUAGE_CODE: 'en',
      NODE_ENV: 'test',
      SECRET: 'private-value',
      WHITELISTED: 'allowed-value',
    };

    const whitelist = ['WHITELISTED'];

    // Act
    const result = getPublicEnvs(env, whitelist);

    // Assert
    expect(result).toEqual({
      NEXT_PUBLIC_LANGUAGE_CODE: 'en',
      NODE_ENV: 'test',
      WHITELISTED: 'allowed-value',
    });
  });

  it('When no whitelist is provided, then it returns only non-empty public variables and NODE_ENV', () => {
    // Arrange
    const env = {
      NEXT_PUBLIC_LANGUAGE_CODE: 'fr',
      NODE_ENV: 'production',
      SECRET: 'private-value',
    };

    // Act
    const result = getPublicEnvs(env);

    // Assert
    expect(result).toEqual({ NEXT_PUBLIC_LANGUAGE_CODE: 'fr', NODE_ENV: 'production' });
  });
});
