# @next-box/appsettings

A type-safe configuration library for TypeScript applications, inspired by .NET's `appsettings.json`.

[![npm version](https://badge.fury.io/js/%40next-box%2Fappsettings.svg)](https://badge.fury.io/js/%40next-box%2Fappsettings)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Applications often need to combine configuration from defaults, files, and environment variables. Keeping those values consistent and validated across an application can be difficult.

`@next-box/appsettings` loads and validates configuration on the server, then provides a read-only settings context for React client components.

## Installation

```shell
# terminal
npm add @next-box/appsettings
```

## Usage

### Define a schema

```ts
// ./src/appSettings.schema.ts
import { z } from 'zod';

export const appSettingsSchema = z.object({
  App: z.object({
    Name: z.string(),
    Environment: z.enum(['development', 'test', 'production']),
  }),
  Api: z.object({
    BaseUrl: z.string().url(),
    Timeout: z.number(),
  }),
  Features: z.object({
    DarkMode: z.boolean(),
    NewDashboard: z.boolean(),
  }),
});

export type AppSettingsConfig = z.infer<typeof appSettingsSchema>;
```

### Load configuration on the server

`createAppSettings` is exported from `@next-box/appsettings/server`. It merges defaults and sources in order, validates the complete result with the schema, and returns plain configuration data suitable for passing to a Client Component.

```ts
// ./src/appSettings.ts
import { AppSettingsSource, createAppSettings, EnvironmentSource } from '@next-box/appsettings/server';
import { appSettingsSchema } from './appSettings.schema';

export const loadAppSettings = () =>
  createAppSettings({
    schema: appSettingsSchema,
    defaults: {
      App: { Name: 'My Application', Environment: 'development' },
      Api: { BaseUrl: 'https://api.example.com', Timeout: 5000 },
      Features: { DarkMode: true, NewDashboard: false },
    },
    sources: [
      new AppSettingsSource({ directory: './config', environment: process.env.NODE_ENV }),
      new EnvironmentSource({ envs: process.env, prefix: 'APP_' }),
    ],
  });
```

Defaults form the first layer; sources load sequentially in declaration order, with later sources overriding earlier values. Plain objects merge recursively. Arrays and primitive values are replaced. Inputs are not mutated. If loading or validation fails, `createAppSettings` rejects and does not return partial configuration.

In Next.js, call the loader from a Server Component and pass the result to the provider:

```tsx
// ./app/layout.tsx
import { AppSettingsProvider } from '@next-box/appsettings';
import { loadAppSettings } from '../src/appSettings';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = await loadAppSettings();

  return (
    <html lang="en">
    <body>
    <AppSettingsProvider settings={settings}>{children}</AppSettingsProvider>
    </body>
    </html>
  );
}
```

The provider creates a read-only in-memory settings instance from the supplied data. Client components do not load files, validate configuration, or reload settings.

### Configure server sources

The `@next-box/appsettings/server` entry provides source classes. Pass instances to `createAppSettings` in the order they should be applied:

- `new AppSettingsSource({ directory, environment })` reads `appsettings.json` followed by `appsettings.{environment}.json` from the filesystem. The environment file is optional and overrides matching values from the base file. If `environment` is omitted, it uses `NODE_ENV` and defaults to `development`.
- `new EnvironmentSource({ envs, prefix })` maps the provided environment variable record into nested settings. Pass `process.env` for Node's environment or a separate record for controlled use.
- `new RemoteSource({ url, fetch, responsePath })` fetches JSON from a URL. `fetch` is required; `responsePath` optionally selects a nested object from the response.
- `new MemorySource({ values })` supplies in-memory values, useful for additional overrides.

Environment keys after the prefix use `__` as a nesting separator. For example, `APP_API__TIMEOUT` maps to `Api.Timeout`. Exact `true`, `false`, and numeric strings are converted to booleans and numbers; other values remain strings.

For example, these sources can be combined in one configuration:

```ts
import {
  AppSettingsSource,
  EnvironmentSource,
  MemorySource,
  RemoteSource,
  createAppSettings,
} from '@next-box/appsettings/server';

const settings = await createAppSettings({
  schema: appSettingsSchema,
  defaults: {
    App: { Name: 'My Application', Environment: 'development' },
    Api: { BaseUrl: 'https://api.example.com', Timeout: 5000 },
    Features: { DarkMode: true, NewDashboard: false },
  },
  sources: [
    new AppSettingsSource({ directory: './config' }),
    new RemoteSource({ url: 'https://config.example.com/appsettings.json', fetch }),
    new EnvironmentSource({ envs: process.env, prefix: 'APP_' }),
    new MemorySource({ values: { Features: { NewDashboard: true } } }),
  ],
});
```

Each later source overrides earlier values according to the merge rules described above. The resulting settings object can be passed to `AppSettingsProvider`.

### Read settings

Paths use dot notation. The library provides two hook factories:

- `createUseSetting` creates a hook for reading individual setting values.
- `createUseAppSettings` creates a hook for reading object sections.

Both factories accept your application's settings type and return a fully typed React hook.

#### Create typed hooks

Create the hooks once, outside your React components:

```ts
// ./src/hooks/appSettings.ts
'use client';

import {
  createUseAppSettings,
  createUseSetting,
} from '@next-box/appsettings';

import type { AppSettingsConfig } from '../appSettings.schema';

export const useSetting = createUseSetting<AppSettingsConfig>();

export const useAppSettings = createUseAppSettings<AppSettingsConfig>();
```

#### Use the hooks in components

```tsx
// ./src/ApiTimeout.tsx
'use client';

import { useAppSettings, useSetting } from './hooks/appSettings';

export const ApiTimeout = () => {
  const timeout = useSetting('Api.Timeout');
  const api = useAppSettings('Api');
  const features = useAppSettings('Features');

  return (
    <span>
      {features?.DarkMode ? `${api?.BaseUrl} (${timeout}ms)` : 'Disabled'}
    </span>
  );
};
```

#### Type inference

Given the `AppSettingsConfig` schema defined above:

```ts
const timeout = useSetting('Api.Timeout');
// number | undefined

const baseUrl = useSetting('Api.BaseUrl');
// string | undefined

const api = useAppSettings('Api');
// { BaseUrl: string; Timeout: number } | undefined

const features = useAppSettings('Features');
// { DarkMode: boolean; NewDashboard: boolean } | undefined

useSetting('Api.InvalidProperty');
// TypeScript error
```

Both hooks return `undefined` when the requested path does not exist.

The settings snapshot is read-only. Configuration is loaded and validated before it reaches the provider; there are no client-side mutation or reload methods.

No module augmentation or generated declaration files are required. Each application supplies its settings type explicitly when creating its hooks.

### Conditionally render with `Setting`

`Setting` renders its children when the current value at `path` strictly equals `value`. Pass an array of expected values to match any one of them. It renders `fallback` when there is no match; `negate` inverts the match.

```tsx
import { Setting } from '@next-box/appsettings';

<Setting path="Features.DarkMode" value={true} fallback={<p>Dark mode is off</p>}>
  <p>Dark mode is on</p>
</Setting>
```

## Changelog

Check out the [features, fixes and more](../../CHANGELOG.md) that go into each major, minor and patch version.

## License

`@next-box/appsettings` is [MIT Licensed](LICENSE).
