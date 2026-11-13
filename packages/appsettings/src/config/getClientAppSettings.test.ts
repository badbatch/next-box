import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';
import { createAppSettings } from './createAppSettings.ts';
import { getClientAppSettings } from './getClientAppSettings.ts';

describe('getClientAppSettings', () => {
  it('When a client snapshot is created from server settings, then Server is omitted without changing the original', async () => {
    // Arrange
    const schema = z.object({
      Bff: z.object({ BaseUrl: z.string() }),
      Server: z.object({ ApiKey: z.string() }),
    });

    const settings = await createAppSettings({
      defaults: { Bff: { BaseUrl: '/api' }, Server: { ApiKey: 'private-key' } },
      schema,
    });

    // Act
    const clientSettings = getClientAppSettings(settings);

    // Assert
    expect(clientSettings).toEqual({ Bff: { BaseUrl: '/api' } });
    expect(JSON.stringify(clientSettings)).not.toContain('private-key');
    expect(settings.Server.ApiKey).toBe('private-key');
    expect(Object.isFrozen(clientSettings)).toBe(true);
  });

  it('When a client snapshot is created without a Server section, then public settings are preserved', () => {
    // Arrange
    const settings = { Application: { Name: 'Admin' }, Bff: { BaseUrl: '/api' } };

    // Act
    const clientSettings = getClientAppSettings(settings);

    // Assert
    expect(clientSettings).toEqual(settings);
  });

  it('When a client snapshot contains a nested Server key, then only the root Server key is removed', () => {
    // Arrange
    const settings = { Bff: { Server: 'public-label' }, Server: undefined };

    // Act
    const clientSettings = getClientAppSettings(settings);

    // Assert
    expect(clientSettings).toEqual({ Bff: { Server: 'public-label' } });
  });

  it('When a client snapshot is created from only server settings, then the snapshot is empty', () => {
    // Arrange
    const settings = { Server: { Secret: 'private' } };

    // Act
    const clientSettings = getClientAppSettings(settings);

    // Assert
    expect(clientSettings).toEqual({});
  });
});
