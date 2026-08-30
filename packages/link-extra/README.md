# @next-box/link-extra

A configurable link component for React applications, primarily designed for Next.js.

[![npm version](https://badge.fury.io/js/%40next-box%2Flink-extra.svg)](https://badge.fury.io/js/%40next-box%2Flink-extra)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Next.js is a powerful framework for building modern React applications, particularly with its support for React Server Components and server-side rendering. However, these features can introduce some differences in navigation behaviour compared with traditional client-side applications.

Client-side navigation can sometimes feel unresponsive when the destination requires server-side work, with the browser waiting for the new route to begin rendering before the UI changes. This has been discussed in the Next.js community, including [Slow route navigation](https://github.com/vercel/next.js/discussions/65150) and [How to indicate loading during pagination](https://github.com/vercel/next.js/discussions/55481).

Next.js also maintains a client-side Router Cache to improve navigation performance. While this is useful for many applications, there are cases where an application needs to ensure that navigation retrieves the latest version of a route. The ability to opt out of this client-side caching has been discussed in [Opt-out of client cache](https://github.com/vercel/next.js/discussions/54162), and the distinction between the Router Cache and server-side caching is discussed in [Deep Dive: Caching and Revalidating](https://github.com/vercel/next.js/discussions/54075).

Finally, applications often have their own link components and design systems. Integrating these with Next.js `Link` can be awkward, particularly when an application needs the `href` applied to its own anchor element rather than having Next.js render the anchor itself. This has been discussed in the Next.js community, including [Add back `passHref` to the new next/link component](https://github.com/vercel/next.js/discussions/49508) and [Remove `legacyBehavior` from Link component on Next.js 15](https://github.com/vercel/next.js/discussions/67987).

`@next-box/link-extra` provides a wrapper around the Next.js `Link` component that addresses these concerns while retaining Next.js client-side navigation.

## What it provides

### Loading feedback

A navigation can take some time to begin rendering, particularly when the destination requires server-side work. `@next-box/link-extra` can display a custom loading component if navigation has not completed within a configurable timeout.

If the route transition completes before the timeout, no loading indicator is displayed. If it takes longer, the loading component is rendered automatically.

### Router cache control

`@next-box/link-extra` provides the `disableRouterCache` prop for cases where an application needs to bypass the Next.js client-side Router Cache.

When enabled, the link adds a cache-busting query parameter to the destination URL. This is enabled by default.

### Custom link components

The library separates the Next.js navigation link from the component used to render the actual link.

This allows applications to provide their own link component for styling and design-system requirements while retaining Next.js navigation behaviour.

## Installation

```shell
npm add @next-box/link-extra
```

## Usage

### Create a link provider

`LinkProvider` supplies the Next.js link, your own link component, and the loading component used by `Link`.

It also receives the current pathname so that it can detect when a navigation has completed.

```tsx
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LinkProvider,
} from '@next-box/link-extra';

const LinkProviderWrapper = ({
  children,
}: {
  children: ReactNode;
}) => {
  const pathname = usePathname();

  return (
    <LinkProvider
      LoadingComponent={Loading}
      NextLink={Link}
      OwnLink={YourLink}
      pathname={pathname}
    >
      {children}
    </LinkProvider>
  );
};
```

For Next.js applications using the App Router, the provider should be placed in a client component because it uses React context and client-side navigation state.

### Render a link

Once the provider has been configured, use the `Link` component in place of your normal Next.js link.

```tsx
import { Link } from '@next-box/link-extra';

const Component = () => {
  return (
    <Link href="/dashboard">
      Dashboard
    </Link>
  );
};
```

### Disable Router Cache

Router cache busting is enabled by default.

To allow Next.js to use its normal Router Cache behaviour for an individual link, set `disableRouterCache` to `false`:

```tsx
<Link
  href="/dashboard"
  disableRouterCache={false}
>
  Dashboard
</Link>
```

### Configure loading behaviour

The loading timeout defaults to `500ms`. This can be changed through `LinkProvider`:

```tsx
<LinkProvider
  LoadingComponent={Loading}
  NextLink={Link}
  OwnLink={YourLink}
  pathname={pathname}
  loadingTimeout={1000}
>
  {children}
</LinkProvider>
```

The loading component is only rendered when a link navigation remains in progress beyond the configured timeout.

### Prevent loading for a link

The loading state is only triggered when the link represents navigation to a different URL and the click has not been prevented.

This means links that point to the current location, or clicks where `event.preventDefault()` has been called, do not trigger the loading indicator.

## Changelog

See the [changelog](../../CHANGELOG.md) for features, fixes, and other changes included in each major, minor, and patch release.

## License

`@next-box/link-extra` is [MIT Licensed](LICENSE).
