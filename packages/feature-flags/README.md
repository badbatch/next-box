# feature-flags

A library for managing feature flags in React applications.

[![npm version](https://badge.fury.io/js/%40next-box%2Ffeature-flags.svg)](https://badge.fury.io/js/%40next-box%2Ffeature-flags)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

// TODO

## Installation

```shell
# terminal
npm add @next-box/feature-flags
```

## Usage

### Create configuration

First create a feature flag config file in the root of your project, this can be a JavaScript, TypeScript or JSON file, and you can name it whatever you like, but for consistency we recommend naming it `featureFlags.config.*`.

The minimum configuration a feature flag requires is `name` and `enabled`. `name` should be screaming snake case and clearly describe the feature flag, `enabled` should default to false.

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

The feature flag config supports conditions, which mirrors the .NET feature management API. Below is an example of a configuration with conditions.

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

There are no builtin implementations for specific client filters. Each client filter declared in the configuration needs to have a corresponding implementation using the `ClientFilter` interface and passed into `FeatureFlagProvider` and/or `createHasFeature`.

```ts
interface ClientFilter<P extends object> {
  name: string;
  resolve: (params: P) => boolean;
}
```

If you are using a TypeScript file for your configuration, you can make use of the library's types for additional type safety.

```ts
// featureFlags.config.ts

import { ClientFilter, FeatureFlag } from '@next-box/feature-flags';
import { PercentageClientFilterOptions, TimeWindowClientFilterOptions } from '#types.ts'

const percentageFilter: ClientFilterConfig<PercentageClientFilterOptions> = {
  name: 'Percentage',
  parameters: {
    value: 50
  }
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
    end: 'Fri, 01 Aug 2025 00:00:00 GMT'
  }
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

### Create client filters

A client filter implements the `ClientFilter` interface and owns the logic for determining whether a condition is met. The `ClientFilter` `resolve` method receives the config parameters as an argument and must return a boolean.

Below is an example of a simple time window client filter implementation.

```ts
import { ClientFilter } from '@next-box/feature-flags';

export type TimeWindowClientFilterOptions = {
  start: string;
  end: string;
}

export class TimeWindowClientFilter implements ClientFilter<TimeWindowClientFilterOptions> {
  name = 'TimeWindow';
  
  resolve({ start, end }) {
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

If you have multiple client filters associated with a feature flag, you can use the `requirementType` config property on `FeatureFlagConditions` to specify whether all client filters must resolve to true or just one must resolve to true for the feature to be on.

### Enabling feature flags

The library enables feature flags via environment variables, specifically Next.js public environment varaibles prefixed with `NEXT_PUBLIC_FF_`. The name of the feature flags are derived from the environment variables, so if an environment variable is `NEXT_PUBLIC_FF_FEATURE_A` then the feature flag name would need to be `FEATURE_A`.

### Add `FeatureFlagProvider`

To use the feature flags, start by wrapping your React application, or the relevant part of it, in the `FeatureFlagProvider`. The provider uses environment variables to determine which feature flags are enabled.

You need to create a client wrapper for `FeatureFlagProvider` because it uses React context and is exported as part of a Rollup bundle so cannot declare its own `'use client'` directive.

```tsx
// ./FeatureFlagProviderWrapper.tsx
'use client';

import { FeatureFlagProvider, type FeatureFlagProviderProps } from '@next-box/feature-flags';
import { type ReactNode } from 'react';
import { clientFilters } from '#clientFilters.ts';
import featureFlags from '#featureFlags.json' with { type: 'json' };

export const FeatureFlagProviderWrapper = ({ children, envs }: { children: ReactNode, envs: Record<string, string | undefined> }) => {
  return (
    <FeatureFlagProvider clientFilters={clientFilters} envs={envs} featureFlags={featureFlags}>
      {children}
    </FeatureFlagProvider>
  );
};
```

```tsx
// ./layout.tsx
import { getPublicEnvs } from '@next-box/envs/server';
import { FeatureFlagProviderWrapper } from '#FeatureFlagProviderWrapper.tsx';

const RootLayout = ({ children }: RootLayoutProps) => {
  const envs = getPublicEnvs(process.env);
  
  return (
    <html lang="en">
    <body>
      <BreadcrumbProviderWrapper envs={envs}>
        {children}
      </BreadcrumbProviderWrapper>
    </body>
    </html>
  );
};

export default RootLayout;
```

## Changelog

Check out the [features, fixes and more](../../CHANGELOG.md) that go into each major, minor and patch version.

## License

@next-box/feature-flags is [MIT Licensed](LICENSE).
