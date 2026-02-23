# @next-box/envs

A library for accessing environment variables on the client in Next.js.

[![npm version](https://badge.fury.io/js/%40dollygrip%2Fbreadcrumb.svg)](https://badge.fury.io/js/%40dollygrip%2Fbreadcrumb)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Accessing environment variables on the client in Next.js is not as straight forward as you might expect, especially if you deploy your application with Docker, use server components, need to access environment variables inside and outside React, etc, etc.

This library tries to make the process as frictionless as possible and give you a consistent way of accessing environment variables anywhere in your "frontend" code.

> It is important to understand when deploying your application with Docker that the Next.js/Webpack mechanism of inlining env vars at build time doesn't work. This is because you typically build a Docker image once and promote it through your environments and in each environment you will likely want different values for the same env vars.

## Installation

```shell
# terminal
npm add @next-box/envs
```

## Usage

### Within React

There are two ways you can go about this with the library. The first is the more standard approach, which is to retrieve the public env vars in a server component and pass them down into your client components.

We recommend doing this in the root `layout.tsx` and passing the env vars down into our `EnvsProvider` context provider, from which you can then access the environment variables in any client React component with the `useEnvs` hook. Below is a basic example of what this might look like.

You need to create a client wrapper for `EnvsProvider` or nest it with a client component because it uses React context and is exported as part of a Rollup bundle so cannot declare its down `'use client'` directive.

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

const RootLayout = async ({ children }: RootLayoutProps) => {
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

The other way of getting public env vars to the client is to use our `PublicEnvVarsScript` component. As it is a script, the component must be used within your root `layout.tsx`. With this approach, you pass public env vars into the component in a similar way to the previous example, however, you are able to access env vars outside React using the `getEnv` function.

The `PublicEnvVarsScript` component renders a script that runs before Next.js is initialised and adds the public env vars to `globalThis.env`.

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

The other thing to note about `getEnv` is it works across Next.js environments. If `window` is defined, the function will get the env var from `globalThis.env`, but if `window` is not defined the function will get the env var from `process.env`.

> If you need to access env vars outside React, you can use both approaches in parallel or just use `PublicEnvVarsScript` and instead of passing the public env vars down into the `EnvsProviderWrapper`, just get the env vars from `globalThis.env` within the wrapper component and pass them down into `EnvsProvider`.

### In Web Workers

You can also access environment variables in web workers through a couple of utility functions. In your main thread, pass the worker into `sendEnvsToWorker` as soon as it is initialised. The function takes the environment variables already assigned to `globalThis.env` and sends them to the worker thread.

```ts
import { sendEnvsToWorker } from '@next-box/envs';

const worker = new Worker(new URL('worker.ts', import.meta.url));
sendEnvsToWorker(worker);
```

In your worker file, you can then use `setWorkerEnvs` to listen for the message from the main thread and set the received environment variables onto the workers `globalThis.env`. The function accepts a callback it will execute once the environment variables are set. This is useful to run defer running code that depends the environment variables.

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
