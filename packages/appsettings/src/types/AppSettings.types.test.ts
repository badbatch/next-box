import { createElement } from 'react';
import { z } from 'zod';
import { AppSettingsProvider, Setting, useAppSetting, useAppSettings } from '../index.ts';
import { createAppSettings } from '../server.ts';

declare module './Config.types.ts' {
  interface AppSettingsSchema {
    Api: { Timeout: number; Url: string };
    Features: { DarkMode: boolean };
  }
}

const schema = z.object({
  Api: z.object({ Timeout: z.number(), Url: z.string() }),
  Features: z.object({ DarkMode: z.boolean() }),
});

const settingsData = {
  Api: { Timeout: 5000, Url: 'https://api.example.com' },
  Features: { DarkMode: true },
};

const assertType = <Expected>(_value: Expected): void => undefined;
assertType<number | undefined>(useAppSetting('Api.Timeout'));
assertType<boolean | undefined>(useAppSetting('Features.DarkMode'));
assertType<number | undefined>(useAppSettings('Api')?.Timeout);

createElement(AppSettingsProvider, { settings: settingsData, children: null });
createElement(Setting, { children: 'Enabled', path: 'Features.DarkMode', value: true });

// @ts-expect-error The selected path determines the expected value type.
createElement(Setting, { children: 'Enabled', path: 'Features.DarkMode', value: 'yes' });

void createAppSettings({ schema, defaults: settingsData }).then(settings => {
  assertType<number>(settings.Api.Timeout);
  assertType<boolean>(settings.Features.DarkMode);
});
