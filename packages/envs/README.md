# @next-box/envs

A library for accessing public environment variables in Next.js.

[![npm version](https://badge.fury.io/js/%40next-box%2Fenvs.svg)](https://badge.fury.io/js/%40next-box%2Fenvs)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Accessing environment variables on the client in Next.js is not as straightforward as you might expect, especially if you deploy your application with Docker, use server components, need to access environment variables inside and outside React, etc, etc.

This library tries to make the process as frictionless as possible and give you a consistent way of accessing **public** environment variables throughout your frontend code.

> When deploying a Next.js application with Docker, it’s important to distinguish between build-time and runtime environment variables. Variables prefixed with `NEXT_PUBLIC_` that are referenced directly by Next.js are inlined into the client-side JavaScript bundle during `next build`. Their values are therefore fixed at build time for that bundle, rather than being read from the environment when the application starts. This can be problematic when promoting the same Docker image between environments.

## Installation

```shell
# terminal
npm add @next-box/envs
```

## Usage

### Within React

There are two ways you can go about this with the library. The first is the more standard approach, which is to retrieve the public env vars in a server component and pass them down into your client components.

We recommend doing this in the root `layout.tsx` and passing the env vars down into our `EnvsProvider` context provider, from which you can then access the environment variables in any client React component with the `useEnvs` hook. Below is a basic example of what this might look like.

You need to create a client wrapper for `EnvsProvider` or nest it within a client component because it uses React context and is exported as part of a Rollup bundle. The bundle does not preserve the `'use client'` directive in a way that allows Next.js to treat `EnvsProvider` itself as a Client Component.

```tsx
// ./EnvsProviderWrapper.tsx
'use client';

import { EnvsProvider, type EnvsProviderProps } from '@next-box/envs';

export const EnvsProviderWrapper = (props: EnvsProviderProps) => {
  return <EnvsProvider {...props} />;
};
```

```tsx
// ./layout.tsx
import { getPublicEnvs } from '@next-box/envs/server';
import { EnvsProviderWrapper } from './EnvsProviderWrapper.tsx';

const RootLayout = ({ children }: RootLayoutProps) => {
  const envs = getPublicEnvs(process.env);

  return (
    <html lang="en">
      <body>
        <EnvsProviderWrapper envs={envs}>
          {children}
        </EnvsProviderWrapper>
      </body>
    </html>
  );
};

export default RootLayout;
```

```tsx
// ./RandomComponent.tsx
import { useEnvs } from '@next-box/envs';

export const RandomComponent = () => {
  const { getEnv } = useEnvs();
  const alpha = getEnv('NEXT_PUBLIC_ALPHA');
  // Do something with alpha...
};
```

### Outside React

Another way to make public environment variables available to client-side code is to use the `PublicEnvVarsScript` component. Because the script needs to be rendered as part of the document, we recommend using the component in your root `layout.tsx`.

With this approach, you pass public env vars into the component in a similar way to the previous example. However, you are also able to access env vars outside React using the `getEnv` function.

The `PublicEnvVarsScript` component renders a script that makes the public env vars available on `globalThis.env` before application code that depends on those values runs.

```tsx
// ./layout.tsx
import { PublicEnvVarsScript, getPublicEnvs } from '@next-box/envs/server';

const RootLayout = async ({ children }: RootLayoutProps) => {
  const envs = getPublicEnvs(process.env);

  return (
    <html lang="en">
      <body>
        <PublicEnvVarsScript envs={envs} />
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
```

```ts
// ./fileOutsideReact
import { getEnv } from '@next-box/envs/server';
import { content as en } from './en/index.ts';
import { content as fr } from './fr/index.ts';

const languages = {
  en,
  fr,
};

const languageCode = getEnv<'en' | 'fr'>('NEXT_PUBLIC_LANGUAGE_CODE');
export const content = languages[languageCode];
```

The other thing to note about `getEnv` is that it works across the environments supported by the library. In a browser environment where `window` is defined, the function gets the env var from `globalThis.env`. When `window` is not defined, the function gets the env var from `process.env`.

> If you need to access env vars outside React, you can use both approaches in parallel. Alternatively, you can use `PublicEnvVarsScript` and, instead of passing the public env vars directly into the `EnvsProviderWrapper`, read them from `globalThis.env` within the wrapper component and pass them into `EnvsProvider`.

### In Web Workers

You can also access environment variables in web workers through a couple of utility functions. In your main thread, pass the worker into `sendEnvsToWorker` after the worker has been initialised. The function takes the public environment variables assigned to `globalThis.env` and sends them to the worker thread.

This requires `globalThis.env` to have already been populated, for example by using `PublicEnvVarsScript`.

```ts
import { sendEnvsToWorker } from '@next-box/envs';

const worker = new Worker(new URL('worker.ts', import.meta.url));
sendEnvsToWorker(worker);
```

In your worker file, you can then use `setWorkerEnvs` to listen for the message from the main thread and set the received environment variables onto the worker's `globalThis.env`. The function accepts a callback that it will execute once the environment variables are set. This is useful for deferring code that depends on the environment variables.

```ts
import { setWorkerEnvs } from '@next-box/envs';

setWorkerEnvs(() => {
  // Run code
});
```

## Changelog

Check out the [features, fixes and more](../../CHANGELOG.md) that go into each major, minor and patch version.

## License

@next-box/envs is [MIT Licensed](LICENSE).
