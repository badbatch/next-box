import { describe, expect, it } from '@jest/globals';
import { EnvironmentSource } from './EnvironmentSource.ts';

describe('EnvironmentSource', () => {
  it('When matching variables are loaded, then it maps nested keys and parses booleans and numbers', async () => {
    // Arrange
    const source = new EnvironmentSource({
      envs: {
        APP_API__BASE_URL: 'https://api.example.com',
        APP_API__TIMEOUT: '5000',
        APP_FEATURES__DARK_MODE: 'true',
        APP_FEATURES__NEW_DASHBOARD: 'false',
        APP_UNSET: undefined,
        OTHER_API__TIMEOUT: '1000',
      },
    });

    // Act
    const result = await source.load();

    // Assert
    expect(result).toEqual({
      Api: { BaseUrl: 'https://api.example.com', Timeout: 5000 },
      Features: { DarkMode: true, NewDashboard: false },
    });

    expect(source.name).toBe('environment:APP_');
  });

  it('When a custom prefix and name are provided, then it uses them and preserves non-numeric values', async () => {
    // Arrange
    const source = new EnvironmentSource({
      envs: { SERVICE_MODE: 'Development', SERVICE_PORT: 'not-a-number' },
      name: 'service-env',
      prefix: 'SERVICE_',
    });

    // Act
    const result = await source.load();

    // Assert
    expect(result).toEqual({ Mode: 'Development', Port: 'not-a-number' });
    expect(source.name).toBe('service-env');
  });
});
