import { describe, expect, it, jest } from '@jest/globals';
import { z } from 'zod';
import { type SettingsSource } from '#types/Source.types.ts';
import { createAppSettings } from './createAppSettings.ts';

describe('createAppSettings', () => {
  it('When sources are provided, then it loads them in order, merges them, and validates the result', async () => {
    // Arrange
    const schema = z.object({ Api: z.object({ BaseUrl: z.string(), Timeout: z.number() }) });
    const defaults = { Api: { BaseUrl: 'https://default.example.com', Timeout: 1000 } };
    const firstLoad = jest.fn(() => Promise.resolve({ Api: { Timeout: 3000 } }));
    const secondLoad = jest.fn(() => Promise.resolve({ Api: { BaseUrl: 'https://api.example.com' } }));
    const firstSource: SettingsSource = { load: firstLoad, name: 'first' };
    const secondSource: SettingsSource = { load: secondLoad, name: 'second' };

    // Act
    const result = await createAppSettings({ defaults, schema, sources: [firstSource, secondSource] });

    // Assert
    expect(firstLoad).toHaveBeenCalledTimes(1);
    expect(secondLoad).toHaveBeenCalledTimes(1);
    expect(result).toEqual({ Api: { BaseUrl: 'https://api.example.com', Timeout: 3000 } });
  });

  it('When no sources are provided, then it validates the defaults', async () => {
    // Arrange
    const defaults = { Api: { Timeout: 1000 } };
    const schema = z.object({ Api: z.object({ Timeout: z.number() }) });

    // Act
    const result = await createAppSettings({ defaults, schema });

    // Assert
    expect(result).toEqual(defaults);
  });

  it('When a source rejects, then it rejects without continuing to later sources', async () => {
    // Arrange
    const error = new Error('Source failed');

    const firstLoad = jest.fn(() => {
      throw error;
    });

    // @ts-expect-error Fine for test
    const secondLoad: jest.Mock<() => never> = jest.fn(() => ({}));

    const sources: SettingsSource[] = [
      { load: firstLoad, name: 'first' },
      { load: secondLoad, name: 'second' },
    ];

    const options = { defaults: {}, schema: z.object({}), sources };

    // Act
    const result = createAppSettings(options);

    // Assert
    await expect(result).rejects.toBe(error);
    expect(secondLoad).not.toHaveBeenCalled();
  });

  it('When the merged settings fail validation, then it rejects with a schema error', async () => {
    // Arrange
    const defaults = { Api: { Timeout: 1000 } };

    const invalidSource: SettingsSource = {
      load: () => Promise.resolve({ Api: { Timeout: 'slow' } }),
      name: 'invalid',
    };

    const options = {
      defaults,
      schema: z.object({ Api: z.object({ Timeout: z.number() }) }),
      sources: [invalidSource],
    };

    // Act
    const result = createAppSettings(options);

    // Assert
    await expect(result).rejects.toThrow();
  });
});
