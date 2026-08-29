# @next-box/breadcrumb

A library for implementing a breadcrumb in React applications.

[![npm version](https://badge.fury.io/js/%40dollygrip%2Fbreadcrumb.svg)](https://badge.fury.io/js/%40dollygrip%2Fbreadcrumb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Implementing and managing a breadcrumb for an application can be time-consuming and complicated. This library tries to simplify the implementation and management through a set of configurable rules that run against a browser route. Rules support regular expression named capture groups, dynamic data fetching, and more.

Rules can be structured per browser route or across browser routes via each rule's regex pattern, whatever makes sense for an application. All rules will be run against each browser route and each matching rule will be applied to a route in the order they are defined.

The library tracks a user's journey through an application and saves the data to session storage. It exposes the data via a React hook, which a consumer can pass to their own breadcrumb component to render. To track the user's journey between sessions, the library supports exporting and importing the breadcrumb history via a React context.

## Installation

```shell
# terminal
npm add @next-box/breadcrumb
```

## Usage

### `BreadcrumbProvider`

To use the breadcrumb, start by wrapping your React application, or the relevant part of it, in the `BreadcrumbProvider`. You must supply `currentPathname` and `routeRules`.

```tsx
import { BreadcrumbProvider } from '@next-box/breadcrumb';

<BreadcrumbProvider
  currentPathname={pathname}
  routeRules={createRouteRules({ client })}
  search={searchParams.toString()}
>
  <App />
</BreadcrumbProvider>
```

```ts
type BreadcrumbProviderProps = {
  children: ReactNode;
  /**
   * The pathname of the current browser URL.
   */
  currentPathname: string;
  /**
   * Use this to import history.
   */
  initialHistory?: string[];
  /**
   * Maximum number of entries in history before it starts
   * dropping entries.
   */
  maxHistory?: number;
  /**
   * If you plan to export the history and re-import it,
   * use `onHistoryChange` to keep track of the history.
   */
  onHistoryChange?: (history: string[]) => void;
  rootPath?: string;
  /**
   * The rules to be run on each entry in the history.
   */
  routeRules: BreadcrumbRouteRule[];
  /**
   * The query string.
   */
  search?: string;
};
```

### `routeRules`

Route rules are core to how the breadcrumb works. You supply a list of rules that run against each entry in the history and have the ability to generate/enrich the text for the breadcrumb label and modify the href.

The rule matching is done with a regular expression run against each url in the history. We make use of named capture groups and these then become the properties for the `captured` object passed to the `resolve` function.

The `resolve` function also gets the existing breadcrumb item, if one exists, because the rules are additive. All matching rules run against a history entry get run in the order they were defined and each one must return a `BreadcrumbItem`.

A rule has the ability to update or overwrite a `BreadcrumbItem` property, and you have control over what rules are configured and in what order.

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

We provide a `CreateRouteRules` type for the pattern of defining your route rules in a function so you can provide your resolvers scope of things such as fetch clients, loggers, etc.

The `resolve` function supports sync and async so it is possible to fetch data using the URL parts captured by the regex.

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
    regex: String.raw`/search-results\?\S*keyphrase=(?<keyphrase>[^&]+)`,
    resolve: ({ keyphrase }, existingItem) => {
      let label = 'Search results';

      if (keyphrase) {
        label += ` for "${startCase(keyphrase.replace('+', ' '))}"`;
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
      return { ...existingItem, label: `Discover ${mapDiscoverTypeRouteToDiscoverTypeLabel(type)}` };
    },
  };

  const homeBreadcrumbRule: BreadcrumbRouteRule = {
    regex: String.raw`^/(?:\?.*)?$`,
    resolve: (_capture, existingItem) => ({ ...existingItem, label: 'Home' }),
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

The `BreadcrumbProvider` owns the history tracking and breadcrumb generation and makes that available to consumers via the `useBreadcrumb` hook. It returns the `BreadcrumbConfig` that includes the breadcrumb items and a callback to pass down to each breadcrumb link's onclick.

```ts
type BreadcrumbConfig = {
  breadcrumb: BreadcrumbItem[];
  /**
   * Allows the `BreadcrumbProvider` to know if the
   * change in history was triggered by clicking on
   * one of its own links.
   */
  onBreadcrumbLinkClick?: OnBreadcrumbLinkClick;
};
```

You can call the `useBreadcrumb` hook in your breadcrumb component and use the `breadcrumb` config to generate the components that make up your breadcrumb.

Remember to pass down the `onBreadcrumbLinkClick` callback to your breadcrumb item links.

Below is a basic example of how you could use the `breadcrumb` config to generate a basic breadcrumb.

```tsx
import { useBreadcrumb } from '@next-box/breadcrumb';

export const Breadcrumb = () => {
  const { breadcrumb, onBreadcrumbLinkClick } = useBreadcrumb();
  const pathname = usePathname();
  const theme = useTheme();

  return (
    <Breadcrumbs
      aria-label="breadcrumb"
      separator={<NavigateNext fontSize="small" />}
    >
      {breadcrumb.map((item, index) =>
        index < breadcrumb.length - 1 ? (
          <TextLink
            key={kebabCase(item.label)}
            onClick={e => {
              onBreadcrumbLinkClick?.(item, e);
            }}
            to={item.href}
          >
            {item.label}
          </TextLink>
        ) : (
          <Typography key={kebabCase(item.label)}>{item.label}</Typography>
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
