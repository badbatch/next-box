import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';
import { assertType } from '../__testUtils__/types.ts';
import { AppSettingsImplementation } from '../config/AppSettingsImplementation.ts';
import { createAppSettings } from '../config/createAppSettings.ts';
import { type AppSettings, type CreateAppSettingsOptions, type ScopedSettings } from './AppSettings.types.ts';
import { type SettingsSource } from './Source.types.ts';

type ExampleSettings = { Api: { Retry?: number; Timeout: number } };

describe('AppSettings types', () => {
  it('When configuration is loaded, then settings and scoped readers expose correctly typed values', async () => {
    // Arrange
    const source: SettingsSource = {
      load: () => Promise.resolve({ Api: { Timeout: 5000 } }),
      name: 'example',
    };

    const options: CreateAppSettingsOptions<ExampleSettings> = {
      defaults: { Api: { Timeout: 1000 } },
      schema: z.object({ Api: z.object({ Retry: z.number().optional(), Timeout: z.number() }) }),
      sources: [source],
    };

    // Act
    const config = await createAppSettings(options);
    const settings: AppSettings<ExampleSettings> = new AppSettingsImplementation(config);
    const scoped: ScopedSettings<{ Retry?: number; Timeout: number }> = settings.scope('Api');
    const timeout = settings.get('Api.Timeout');
    const retry = settings.get('Api.Retry');
    const requiredTimeout = settings.getOrThrow('Api.Timeout');
    const all = settings.getAll();
    const section = settings.getSection('Api');
    const hasTimeout = settings.has('Api.Timeout');
    const scopedTimeout = scoped.get('Timeout');
    const scopedRequiredTimeout = scoped.getOrThrow('Timeout');
    const scopedAll = scoped.getAll();

    assertType<number | undefined>(timeout);
    assertType<number | undefined>(retry);
    assertType<number>(requiredTimeout);
    assertType<Readonly<ExampleSettings>>(all);
    assertType<ExampleSettings['Api'] | undefined>(section);
    assertType<boolean>(hasTimeout);
    assertType<number | undefined>(scopedTimeout);
    assertType<number>(scopedRequiredTimeout);
    assertType<Readonly<ExampleSettings['Api']>>(scopedAll);

    // Assert
    expect(timeout).toBe(5000);
    expect(retry).toBeUndefined();
    expect(requiredTimeout).toBe(5000);
    expect(all).toEqual({ Api: { Timeout: 5000 } });
    expect(section).toEqual({ Timeout: 5000 });
    expect(hasTimeout).toBe(true);
    expect(scopedTimeout).toBe(5000);
    expect(scopedRequiredTimeout).toBe(5000);
    expect(scopedAll).toEqual({ Timeout: 5000 });
  });
});
