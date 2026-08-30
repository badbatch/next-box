# @next-box/feature-flags

A lightweight, configuration-driven feature-flag library for React applications.

[![npm version](https://badge.fury.io/js/%40next-box%2Ffeature-flags.svg)](https://badge.fury.io/js/%40next-box%2Ffeature-flags)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Managing feature flags across different environments can quickly become difficult as applications grow. Developers often end up scattering environment-variable checks throughout their React components, making feature rollout logic harder to understand, test, and maintain. This also makes it harder to introduce more sophisticated rollout strategies without adding feature-specific logic throughout the application.

`@next-box/feature-flags` provides a configuration-driven approach to feature flags, allowing feature definitions to live separately from application code while environment variables control their runtime state. Custom client filters can be used to implement more advanced rollout strategies, such as percentage-based rollouts, time windows, user segments, and other application-specific conditions.

The configuration model is inspired by the [.NET Feature Management API](https://learn.microsoft.com/en-us/azure/azure-app-configuration/feature-management-dotnet-reference), providing a familiar and structured way to define feature flags and their conditions while keeping the library lightweight and extensible.

## Installation

```shell
npm add @next-box/feature-flags
```

## Usage

### Create a feature flag configuration

Start by creating a feature flag configuration file in the root of your project. The configuration can be a JavaScript, TypeScript, or JSON file and can be named whatever you like. For consistency, we recommend using `featureFlags.config.*`.

The minimum configuration for a feature flag requires a `name` and `enabled` property.

- `name` should use `SCREAMING_SNAKE_CASE` and clearly describe the feature.
- `enabled` should default to `false`, providing a safe default when a feature has not been explicitly enabled.

```jsonc
// featureFlags.config.json

[
  {
    "name": "FEATURE_A",
    "enabled": false
  },
  {
    "name": "FEATURE_B",
    "enabled": false
  }
]
```

#### Add conditions

Feature flags can optionally define conditions using client filters. The configuration model mirrors the [.NET Feature Management API](https://learn.microsoft.com/en-us/azure/azure-app-configuration/feature-management-dotnet-reference).

For example:

```jsonc
// featureFlags.config.json

[
  {
    "name": "PERCENTAGE_FEATURE",
    "enabled": false,
    "conditions": {
      "clientFilters": [
        {
          "name": "Percentage",
          "parameters": {
            "value": "50"
          }
        }
      ]
    }
  },
  {
    "name": "TIME_WINDOW_FEATURE",
    "enabled": false,
    "conditions": {
      "clientFilters": [
        {
          "name": "TimeWindow",
          "parameters": {
            "start": "Sun, 01 Jun 2025 13:59:59 GMT",
            "end": "Fri, 01 Aug 2025 00:00:00 GMT"
          }
        }
      ]
    }
  }
]
```

The library does not provide built-in implementations for specific client filters. Each client filter declared in your configuration must have a corresponding implementation using the `ClientFilter` interface.

Client filters are passed to `FeatureFlagProvider` and/or `createHasFeature`.

```ts
interface ClientFilter<P extends object> {
  name: string;
  resolve: (params: P) => boolean;
}
```

The `name` property identifies the filter referenced by the configuration, while `resolve` contains the logic for determining whether the filter is satisfied.

#### TypeScript configuration

If you use a TypeScript configuration file, you can import the library's types for additional type safety.

```ts
// featureFlags.config.ts

import type {
  ClientFilterConfig,
  FeatureFlag,
} from '@next-box/feature-flags';

import type {
  PercentageClientFilterOptions,
  TimeWindowClientFilterOptions,
} from '#types.ts';

const percentageFilter: ClientFilterConfig<PercentageClientFilterOptions> = {
  name: 'Percentage',
  parameters: {
    value: 50,
  },
};

const percentageFeature: FeatureFlag = {
  name: 'PERCENTAGE_FEATURE',
  enabled: false,
  conditions: {
    clientFilters: [
      percentageFilter,
    ],
  },
};

const timeWindowFilter: ClientFilterConfig<TimeWindowClientFilterOptions> = {
  name: 'TimeWindow',
  parameters: {
    start: 'Sun, 01 Jun 2025 13:59:59 GMT',
    end: 'Fri, 01 Aug 2025 00:00:00 GMT',
  },
};

const timeWindowFeature: FeatureFlag = {
  name: 'TIME_WINDOW_FEATURE',
  enabled: false,
  conditions: {
    clientFilters: [
      timeWindowFilter,
    ],
  },
};

export default [
  percentageFeature,
  timeWindowFeature,
];
```

Using TypeScript allows you to define the expected parameters for each client filter, helping catch configuration errors during development.

### Create client filters

A client filter implements the `ClientFilter` interface and owns the logic for determining whether a condition is satisfied.

The `resolve` method receives the parameters defined in the feature flag configuration and must return a boolean.

For example, the following client filter enables a feature only within a specified time window:

```ts
import type { ClientFilter } from '@next-box/feature-flags';

export type TimeWindowClientFilterOptions = {
  start: string;
  end: string;
};

export class TimeWindowClientFilter
  implements ClientFilter<TimeWindowClientFilterOptions>
{
  name = 'TimeWindow';

  resolve({ start, end }: TimeWindowClientFilterOptions) {
    const now = new Date();

    if (start && now < new Date(start)) {
      return false;
    }

    if (end && now > new Date(end)) {
      return false;
    }

    return true;
  }
}
```

Client filters can contain any application-specific logic you require. This makes it possible to implement filters for scenarios such as user segments, percentage rollouts, time windows, permissions, or other runtime conditions.

#### Multiple client filters

A feature flag can have multiple client filters.

Use the `requirementType` property on `FeatureFlagConditions` to control how multiple filters are evaluated:

- `All` — every client filter must resolve to `true`.
- `Any` — at least one client filter must resolve to `true`.

This allows multiple conditions to be combined when determining whether a feature should be enabled.

The `enabled` property controls whether the feature is enabled by default, while client filters provide additional conditions that must be satisfied. The feature is enabled only when its configured state and client filters evaluate to `true`.

### Enabling feature flags

Feature flags are enabled through environment variables.

For Next.js applications, the library uses public environment variables prefixed with `NEXT_PUBLIC_FF_`.

> **Important:** Feature flags are exposed to client-side code and should not be used as a security or authorization boundary. Always enforce permissions and other security-sensitive behaviour on the server.

The feature flag name is derived from the environment variable name. For example:

```shell
NEXT_PUBLIC_FF_FEATURE_A=true
```

corresponds to the following feature flag:

```json
{
  "name": "FEATURE_A",
  "enabled": false
}
```

The environment variable controls the runtime state of the feature flag without requiring changes to the feature flag configuration itself.

This makes it possible to use different feature-flag states across environments—for example, enabling a feature in development or staging while keeping it disabled in production.

### Add `FeatureFlagProvider`

To use feature flags in your React application, wrap the application—or the relevant part of it—in `FeatureFlagProvider`.

The provider receives:

- `featureFlags` — your feature flag configuration.
- `clientFilters` — the client filter implementations referenced by your configuration.
- `envs` — the public environment variables used to determine the runtime state of the feature flags.

#### Create a client wrapper

Because `FeatureFlagProvider` uses React context, it must run as a client component.

The package is distributed as a Rollup bundle and therefore cannot declare its own `'use client'` directive. For Next.js applications, create a small client wrapper around the provider:

```tsx
// ./FeatureFlagProviderWrapper.tsx

'use client';

import {
  FeatureFlagProvider,
} from '@next-box/feature-flags';
import type { ReactNode } from 'react';

import { clientFilters } from '#clientFilters.ts';
import featureFlags from '#featureFlags.json' with { type: 'json' };

export const FeatureFlagProviderWrapper = ({
  children,
  envs,
}: {
  children: ReactNode;
  envs: Record<string, string | undefined>;
}) => {
  return (
    <FeatureFlagProvider
      clientFilters={clientFilters}
      envs={envs}
      featureFlags={featureFlags}
    >
      {children}
    </FeatureFlagProvider>
  );
};
```

You can then use the wrapper from your Next.js root layout:

```tsx
// ./layout.tsx

import { getPublicEnvs } from '@next-box/envs/server';
import { FeatureFlagProviderWrapper } from '#FeatureFlagProviderWrapper.tsx';

const RootLayout = ({ children }: RootLayoutProps) => {
  const envs = getPublicEnvs(process.env);

  return (
    <html lang="en">
      <body>
        <FeatureFlagProviderWrapper envs={envs}>
          {children}
        </FeatureFlagProviderWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
```

Once the provider has been added, feature flags can be consumed by React components within its tree.

### Consuming feature flags

#### Inside React

There are two ways to access feature flags within React: the `useFeature` hook and the `Feature` component.

`useFeature` takes the name of a feature and returns a boolean indicating whether the feature is enabled. Use it when the feature state needs to control application logic or when you need to render different content.

```tsx
import { useFeature } from '@next-box/feature-flags';

const Dashboard = () => {
  const newDashboardEnabled = useFeature('NEW_DASHBOARD');

  if (newDashboardEnabled) {
    return <NewDashboard />;
  }

  return <Dashboard />;
};
```

The `Feature` component provides a declarative alternative for conditional rendering. It uses `useFeature` under the hood and renders its children only when the specified feature is enabled.

```tsx
import { Feature } from '@next-box/feature-flags';

const Navigation = () => {
  return (
    <nav>
      <a href="/dashboard">Dashboard</a>

      <Feature name="NEW_DASHBOARD">
        <a href="/dashboard/new">Try the new dashboard</a>
      </Feature>
    </nav>
  );
};
```

#### Outside React

For code that runs outside of React, such as server-side logic or utility functions, the library provides `createHasFeature`.

`createHasFeature` is a curried function. The first application configures the feature evaluator with your client filters and feature flag configuration. The returned function can then be used to check individual feature flags by name.

```ts
import {
  createHasFeature,
} from '@next-box/feature-flags/server';

import { clientFilters } from '#clientFilters.ts';
import featureFlags from '#featureFlags.ts';

export const hasFeature = createHasFeature({
  clientFilters,
  featureFlags,
});
```

The returned `hasFeature` function can then be used anywhere you need to evaluate a feature flag:

```ts
const isNewDashboardEnabled = hasFeature('NEW_DASHBOARD');

if (isNewDashboardEnabled) {
  // New dashboard logic
}
```

Keeping the first application in a shared module means the feature configuration and client filters only need to be supplied once, while the resulting `hasFeature` function can be reused throughout the application.

## Changelog

See the [changelog](../../CHANGELOG.md) for features, fixes, and other changes included in each major, minor, and patch release.

## License

`@next-box/feature-flags` is [MIT Licensed](LICENSE).
