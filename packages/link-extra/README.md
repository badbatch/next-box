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
