import { expect, it } from '@jest/globals';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import { z } from 'zod';
import { AppSettingsProvider, Setting } from './index.ts';
import { createAppSettings, environmentSource, memorySource, remoteSource } from './server.ts';

const schema = z.object({
  Api: z.object({ Timeout: z.number(), Url: z.string() }),
  Features: z.object({ DarkMode: z.boolean() }),
  Tags: z.array(z.string()),
});

it('loads sources in order, merges objects, and replaces arrays', async () => {
  const settings = await createAppSettings({
    defaults: { Api: { Timeout: 5000, Url: 'https://default.test' }, Features: { DarkMode: false }, Tags: ['default'] },
    schema,
    sources: [
      memorySource({ Api: { Timeout: 3000 } }),
      memorySource({ Api: { Url: 'https://override.test' }, Tags: ['source'] }),
    ],
  });

  expect(settings.Api.Timeout).toBe(3000);
  expect(settings.Api.Url).toBe('https://override.test');
  expect(settings.Tags).toEqual(['source']);
});

it('validates defaults and returns plain configuration data', async () => {
  const settings = await createAppSettings({
    defaults: { Api: { Timeout: 5000, Url: 'https://default.test' }, Features: { DarkMode: false }, Tags: ['default'] },
    schema,
  });

  expect(settings.Features.DarkMode).toBe(false);
  expect(settings.Api.Timeout).toBe(5000);
  expect(settings).not.toHaveProperty('load');
  expect(settings).not.toHaveProperty('reload');
});

it('renders Setting children from the provider configuration', async () => {
  const settings = await createAppSettings({
    defaults: { Api: { Timeout: 5000, Url: 'https://default.test' }, Features: { DarkMode: true }, Tags: ['default'] },
    schema,
  });

  const output = renderToString(
    createElement(
      AppSettingsProvider,
      {
        settings,
      },
      createElement(Setting, { path: 'Features.DarkMode', value: true }, 'Dark mode'),
    ),
  );

  expect(output).toContain('Dark mode');
});

it('loads and parses Node environment variables into nested settings', async () => {
  const values = await environmentSource({
    env: { APP_API__TIMEOUT: '3000', APP_FEATURES__DARK_MODE: 'true' },
    prefix: 'APP_',
  }).load();

  expect(values).toEqual({ Api: { Timeout: 3000 }, Features: { DarkMode: true } });
});

it('loads object configuration from JSON fetch', async () => {
  const source = remoteSource({
    fetch: () => Promise.resolve(Response.json({ Api: { Timeout: 3000 } })),
    path: '/appsettings.json',
  });

  await expect(source.load()).resolves.toEqual({ Api: { Timeout: 3000 } });
});
