import { describe, expect, it } from '@jest/globals';
import { getEnv } from './getEnv.ts';

describe('getEnv', () => {
  it('When running in Node, then it returns the value from process.env', () => {
    // Arrange
    const key = 'NEXT_PUBLIC_GET_ENV_TEST_VALUE';
    const originalValue = process.env[key];
    process.env[key] = 'server-value';

    // Act
    const result = getEnv<'server-value'>(key);

    // Assert
    expect(result).toBe('server-value');

    if (originalValue === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = originalValue;
    }
  });

  it('When running outside Node, then it returns the value from globalThis.env', () => {
    // Arrange
    const key = 'NEXT_PUBLIC_GET_ENV_TEST_VALUE';
    const originalProcessDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'process');
    const originalEnvDescriptor = Object.getOwnPropertyDescriptor(globalThis, 'env');

    Object.defineProperty(globalThis, 'process', { configurable: true, value: {} });
    Object.defineProperty(globalThis, 'env', {
      configurable: true,
      value: { [key]: 'browser-value' },
      writable: true,
    });

    // Act
    const result = getEnv<'browser-value'>(key);

    // Assert
    expect(result).toBe('browser-value');

    if (originalProcessDescriptor) {
      Object.defineProperty(globalThis, 'process', originalProcessDescriptor);
    }

    if (originalEnvDescriptor) {
      Object.defineProperty(globalThis, 'env', originalEnvDescriptor);
    } else {
      Reflect.deleteProperty(globalThis, 'env');
    }
  });
});
