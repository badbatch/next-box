import { describe, expect, it } from '@jest/globals';
import { z } from 'zod';
import { type AppSettings, type CreateAppSettingsOptions, type ScopedSettings } from './AppSettings.types.ts';
import { type SettingsSource } from './Source.types.ts';

type ExampleSettings = { Api: { Timeout: number } };
const source: SettingsSource = { load: async () => ({ Api: { Timeout: 5000 } }), name: 'example' };
const options: CreateAppSettingsOptions<ExampleSettings> = {
  defaults: { Api: { Timeout: 1000 } },
  schema: z.object({ Api: z.object({ Timeout: z.number() }) }),
  sources: [source],
};

const assertAppSettingsTypes = (settings: AppSettings<ExampleSettings>, scoped: ScopedSettings<ExampleSettings>): void => {
  const timeout: number | undefined = settings.get('Api.Timeout');
  const requiredTimeout: number = settings.getOrThrow('Api.Timeout');
  const all: Readonly<ExampleSettings> = settings.getAll();
  const scopedTimeout: number | undefined = scoped.get('Api.Timeout');

  void [timeout, requiredTimeout, all, scopedTimeout, options];
};

describe('settings API types', () => {
  it('When compiled, then the public settings and source types preserve their declared contracts', () => {
    // Arrange
    const assertions = assertAppSettingsTypes;

    // Act
    const isFunction = typeof assertions === 'function';

    // Assert
    expect(isFunction).toBe(true);
  });
});
