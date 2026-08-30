# @next-box/breadcrumb

A library for implementing a breadcrumb in React applications.

[![npm version](https://badge.fury.io/js/%40next-box%2Fbreadcrumb.svg)](https://badge.fury.io/js/%40next-box%2Fbreadcrumb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Implementing and managing a breadcrumb for an application can be time-consuming and complicated. This library simplifies breadcrumb implementation and management through a set of configurable rules that run against route paths and query strings. Rules support regular expression named capture groups, dynamic data fetching, and more.

Rules can be structured per route or across multiple routes via each rule's regex pattern, whatever makes sense for an application. All rules are run against each history entry, and each matching rule is applied to that entry in the order the rules are defined.

The library maintains a user's breadcrumb history and saves it to `sessionStorage`. It exposes the generated breadcrumb via a React hook, which consumers can use to render their own breadcrumb component. To persist breadcrumb history beyond the current browser session, the library supports exporting and importing the history via the provider.

## Installation

```shell
# terminal
npm add @next-box/breadcrumb
```

## Usage

### `BreadcrumbProvider`

To use the breadcrumb, start by wrapping your React application, or the relevant part of it, in the `BreadcrumbProvider`. You must supply `currentPathname` and `routeRules`.

You need to create a client wrapper for `BreadcrumbProvider` or nest it within a client component because it uses React context and is exported as part of a Rollup bundle. The published bundle does not preserve the `'use client'` directive in a way that allows Next.js to treat `BreadcrumbProvider` itself as a Client Component.

```tsx
// ./BreadcrumbProviderWrapper.tsx
'use client';

import { BreadcrumbProvider, type BreadcrumbRouteRule } from '@next-box/breadcrumb';
import { usePathname, useSearchParams } from 'next/navigation';
import { type ReactNode } from 'react';

export const BreadcrumbProviderWrapper = ({
  children,
  routeRules,
}: {
  children: ReactNode;
  routeRules: BreadcrumbRouteRule[];
}) => {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <BreadcrumbProvider
      currentPathname={pathname}
      routeRules={routeRules}
      search={searchParams.toString()}
    >
      {children}
    </BreadcrumbProvider>
  );
};
```

```tsx
// ./layout.tsx
import { BreadcrumbProviderWrapper } from '#BreadcrumbProviderWrapper.tsx';
import { createFetchClient } from '#createFetchClient.ts';
import { createRouteRules } from '#createRouteRules.ts';

const RootLayout = ({ children }: RootLayoutProps) => {
  const fetchClient = createFetchClient();
  
  return (
    <html lang="en">
      <body>
        <BreadcrumbProviderWrapper
          routeRules={createRouteRules({ client: fetchClient })}
        >
          {children}
        </BreadcrumbProviderWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
```

```ts
type BreadcrumbProviderProps = {
  children: ReactNode;
  /**
   * The pathname of the current browser URL.
   */
  currentPathname: string;
  /**
   * Initial breadcrumb history, for example history
   * previously exported by the provider.
   */
  initialHistory?: string[];
  /**
   * Maximum number of entries in history before it starts
   * dropping entries.
   */
  maxHistory?: number;
  /**
   * Called whenever the history changes. Use this to keep
   * track of the history if you plan to export and
   * re-import it.
   */
  onHistoryChange?: (history: string[]) => void;
  rootPath?: string;
  /**
   * The rules to run against each entry in the history.
   */
  routeRules: BreadcrumbRouteRule[];
  /**
   * The query string of the current URL.
   */
  search?: string;
};
```

### `routeRules`

Route rules are core to how the breadcrumb works. You supply a list of rules that run against each entry in the history and have the ability to generate or enrich the text for the breadcrumb label and modify the href.

Rule matching is performed using a regular expression against each history entry. Named capture groups from the regular expression become the properties of the `captured` object passed to the `resolve` function.

The `resolve` function also receives the existing `BreadcrumbItem`, if one exists, because rules are additive. All rules that match a history entry are run in the order they were defined, and each resolver must return the resulting `BreadcrumbItem`.

A rule can update or overwrite any `BreadcrumbItem` property, and you have control over which rules are configured and the order in which they are applied.

```ts
interface BreadcrumbRouteRule<T extends object = object> {
  regex: string;
  resolve: (captured: T, existing: BreadcrumbItem) => Promisable<BreadcrumbItem>;
}

type BreadcrumbItem = {
  href: string;
  index: number;
  label: string;
};
```

We provide a `CreateRouteRules` type for the pattern of defining your route rules in a function so you can provide your resolvers with access to things such as fetch clients and loggers.

The `resolve` function supports both synchronous and asynchronous implementations, so it is possible to fetch data using the URL parts captured by the regex.

```ts
import { type BreadcrumbRouteRule, type CreateRouteRules } from '@next-box/breadcrumb';

export const createRouteRules: CreateRouteRules<CreateRouteRulesOptions> = ({ client }) => {
  const detailsBreadcrumbRule: BreadcrumbRouteRule<{ id: string; type: string }> = {
    regex: String.raw`/details/(?<type>[^/]+)/(?<id>[^?]+)`,
    resolve: async ({ id, type }, existingItem) => {
      // type is the named capture group for the section type route
      const sectionType = mapSectionTypeRouteToSectionType(type);
      const query = queries[sectionType];

      try {
        const result = await client.query(query, { variables: { id } });

        return {
          ...existingItem,
          label: result.name,
        };
      } catch {
        return existingItem;
      }
    },
  };

  const searchBreadcrumbRule: BreadcrumbRouteRule<{ keyphrase?: string }> = {
    regex: String.raw`/search-results\?(?:[^&]*&)*keyphrase=(?<keyphrase>[^&]+)(?:&[^&]*)*`,
    resolve: ({ keyphrase }, existingItem) => {
      let label = 'Search results';

      if (keyphrase) {
        label += ` for "${startCase(keyphrase.replaceAll('+', ' '))}"`;
      }

      return {
        ...existingItem,
        label,
      };
    },
  };

  const discoverBreadcrumbRule: BreadcrumbRouteRule<{ type?: string }> = {
    regex: String.raw`/discover/(?<type>[^?]*)`,
    resolve: ({ type = DiscoverTypeRoute.Movies }, existingItem) => {
      return {
        ...existingItem,
        label: `Discover ${mapDiscoverTypeRouteToDiscoverTypeLabel(type)}`,
      };
    },
  };

  const homeBreadcrumbRule: BreadcrumbRouteRule = {
    regex: String.raw`^/(?:\?.*)?$`,
    resolve: (_capture, existingItem) => ({
      ...existingItem,
      label: 'Home',
    }),
  };

  const excludeSearchParamsRule: BreadcrumbRouteRule = {
    regex: String.raw`^.*\?[^\s#]+$`,
    resolve: (_capture, existingItem) => ({
      ...existingItem,
      href: excludeSearchParams(existingItem.href, ['previewId', 'previewType']),
    }),
  };

  return [
    detailsBreadcrumbRule,
    searchBreadcrumbRule,
    discoverBreadcrumbRule,
    homeBreadcrumbRule,
    excludeSearchParamsRule,
  ];
};
```

### `useBreadcrumb`

The `BreadcrumbProvider` owns the history tracking and breadcrumb generation and makes the resulting configuration available to consumers via the `useBreadcrumb` hook. It returns a `BreadcrumbConfig` containing the breadcrumb items and a callback that can be passed to breadcrumb links.

```ts
type BreadcrumbConfig = {
  breadcrumb: BreadcrumbItem[];
  /**
   * Allows the BreadcrumbProvider to know when a history
   * change was triggered by clicking one of its breadcrumb
   * links.
   */
  onBreadcrumbLinkClick?: OnBreadcrumbLinkClick;
};
```

You can call the `useBreadcrumb` hook in your breadcrumb component and use the `breadcrumb` config to generate the components that make up your breadcrumb.

Remember to pass the `onBreadcrumbLinkClick` callback to your breadcrumb item links so the provider can distinguish breadcrumb navigation from other history changes.

Below is a basic example of how you could use the `breadcrumb` config to generate a breadcrumb.

```tsx
import { useBreadcrumb } from '@next-box/breadcrumb';

export const Breadcrumb = () => {
  const { breadcrumb, onBreadcrumbLinkClick } = useBreadcrumb();

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNext fontSize="small" />}
    >
      {breadcrumb.map((item, index) =>
        index < breadcrumb.length - 1 ? (
          <TextLink
            key={`${item.index}-${item.href}`}
            onClick={e => {
              onBreadcrumbLinkClick?.(item, e);
            }}
            to={item.href}
          >
            {item.label}
          </TextLink>
        ) : (
          <Typography key={`${item.index}-${item.href}`}>
            {item.label}
          </Typography>
        ),
      )}
    </Breadcrumbs>
  );
};
```

## Changelog

Check out the [features, fixes and more](../../CHANGELOG.md) that go into each major, minor and patch version.

## License

@next-box/breadcrumb is [MIT Licensed](LICENSE).
