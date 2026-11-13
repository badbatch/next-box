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

`createAppSettings` is exported from `@next-box/appsettings/server`. It merges defaults and sources in order, validates the complete result with the schema, and returns the full validated configuration, including the reserved root `Server` section. Project it with `getClientAppSettings` before passing it to any Client Component.

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
import { getClientAppSettings } from '@next-box/appsettings/server';
import { loadAppSettings } from '../src/appSettings';

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = getClientAppSettings(await loadAppSettings());

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

### Server-only configuration

The root `Server` section is reserved for server-only values. `createAppSettings` keeps it available to server code. `getClientAppSettings(settings)`, exported from `@next-box/appsettings/server`, returns a read-only snapshot with that section removed and preserves all other root sections such as `Bff` and `Application`.

Call the projection on the server **before** passing settings to any Client Component, including your own provider wrappers. Filtering inside a Client Component is too late: its props have already been serialized to the browser. `AppSettingsProvider` rejects snapshots containing `Server` at runtime and in its prop types; it cannot undo an earlier serialization.

```ts
const settings = await loadAppSettings();
// Server code can use settings.Server.Api.BaseUrl.
const clientSettings = getClientAppSettings(settings);
// Only clientSettings may be passed to Client Components.
```

`ClientAppSettings<T>` omits the root `Server` key. Hook factories, `useAppSettingsContext`, and `Setting` use this client type even when supplied the complete application schema, so `Server` paths cannot be requested through browser bindings. Server-side readers retain the complete schema. Only the exact root `Server` key is private; keep secrets inside that section.

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

Each later source overrides earlier values according to the merge rules described above. Pass `getClientAppSettings(settings)` to `AppSettingsProvider` from a Server Component.

### Read settings

Paths use dot notation. The library provides four hook factories:

- `createUseSetting` creates a hook for reading individual setting values.
- `createUseAppSettings` creates a hook for reading object sections.
- `createUseSettingOrThrow` creates a hook for reading individual setting values, throwing an error if the requested setting is `undefined`.
- `createUseAppSettingsOrThrow` creates a hook for reading object sections, throwing an error if the requested section is `undefined`.

Both optional and throwing variants accept your application's settings type and return a fully typed React hook.

#### Create typed hooks

Create the hooks once, outside your React components:

```ts
// ./src/hooks/appSettings.ts
'use client';

import {
  createUseAppSettings,
  createUseAppSettingsOrThrow,
  createUseSetting,
  createUseSettingOrThrow,
} from '@next-box/appsettings';

import type { AppSettingsConfig } from '../appSettings.schema';

export const useSetting = createUseSetting<AppSettingsConfig>();
export const useAppSettings = createUseAppSettings<AppSettingsConfig>();

export const useSettingOrThrow = createUseSettingOrThrow<AppSettingsConfig>();
export const useAppSettingsOrThrow = createUseAppSettingsOrThrow<AppSettingsConfig>();
```

#### Use the hooks in components

Use the optional variants when a setting might not exist and your component can handle that case. Use the throwing variants when a setting is required and its absence should be treated as an error.

```tsx
// ./src/ApiTimeout.tsx
'use client';

import {
  useAppSettings,
  useAppSettingsOrThrow,
  useSetting,
  useSettingOrThrow,
} from './hooks/appSettings';

export const ApiTimeout = () => {
  // Optional reads
  const timeout = useSetting('Api.Timeout');
  const features = useAppSettings('Features');

  // Required reads
  const api = useAppSettingsOrThrow('Api');
  const baseUrl = useSettingOrThrow('Api.BaseUrl');

  return (
    <span>
      {features?.DarkMode
        ? `${api.BaseUrl} (${timeout ?? 'default'}ms)`
        : `${baseUrl} is disabled`}
    </span>
  );
};
```

#### Type inference

Given the `AppSettingsConfig` schema defined above:

##### Optional hooks**

```ts
const timeout = useSetting('Api.Timeout');
// number | undefined

const baseUrl = useSetting('Api.BaseUrl');
// string | undefined

const api = useAppSettings('Api');
// { BaseUrl: string; Timeout: number } | undefined

const features = useAppSettings('Features');
// { DarkMode: boolean; NewDashboard: boolean } | undefined
```

##### Throwing hooks

```ts
const timeout = useSettingOrThrow('Api.Timeout');
// number

const baseUrl = useSettingOrThrow('Api.BaseUrl');
// string

const api = useAppSettingsOrThrow('Api');
// { BaseUrl: string; Timeout: number }

const features = useAppSettingsOrThrow('Features');
// { DarkMode: boolean; NewDashboard: boolean }
```

All four hooks provide compile-time path validation:

```ts
useSetting('Api.InvalidProperty');
// TypeScript error

useSettingOrThrow('Api.InvalidProperty');
// TypeScript error

useAppSettings('InvalidSection');
// TypeScript error

useAppSettingsOrThrow('InvalidSection');
// TypeScript error
```

The optional hooks return `undefined` when the requested path does not exist.

The throwing hooks throw an `Error` when the requested path resolves to `undefined`. They are useful when a setting is required and the application should fail rather than continue with a missing value.

Note that the throwing hooks only check for `undefined`; values such as `null`, `false`, `0`, and empty strings are returned normally.

The settings snapshot is read-only. Configuration is loaded and validated before it reaches the provider; there are no client-side mutation or reload methods.

No module augmentation or generated declaration files are required. Each application supplies its settings type explicitly when creating its hooks.

## Changelog

Check out the [features, fixes and more](../../CHANGELOG.md) that go into each major, minor and patch version.

## License

`@next-box/appsettings` is [MIT Licensed](LICENSE).
