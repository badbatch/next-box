# @next-box/i18n

A type-safe content resolver with content path auto-complete, value preview, and markdown support.

[![npm version](https://badge.fury.io/js/%40next-box%2Fi18n.svg)](https://badge.fury.io/js/%40next-box%2Fi18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> To use this library, you must be able and willing to define your content in TypeScript and markdown files.

## Installation

```shell
# terminal
npm add @next-box/i18n
```

## Usage

### Create content files

Content needs to be provided to the library's `createI18n` init function in the form of a serializable object. Each language for which you have content should live in its own file, be structured the same way, and have a `content` named export.

Below is a simplistic example of how to define a content file that is compatible with `createI18n`.

```ts
// ./content.ts
export const content = {
  pages: {
    homepage: {
      documentTitle: 'This is the homepage',
    },
  },
} as const; // Important for preserving the literal types used by the typed resolver.
```

If you support multiple languages, your content files might look like the examples below.

```ts
// ./content/fr/index.ts
export const content = {
  pages: {
    homepage: {
      documentTitle: 'Voici la page d’accueil',
    },
  },
} as const; // This is important!
```

```ts
// ./content/en/index.ts
export const content = {
  pages: {
    homepage: {
      documentTitle: 'This is the homepage',
    },
  },
} as const; // This is important!
```

```ts
// ./.env.d.ts
declare namespace NodeJS {
  interface ProcessEnv {
    NEXT_PUBLIC_LANGUAGE_CODE: 'en' | 'fr';
  }
}
```

```ts
// ./content/index.ts
const { NEXT_PUBLIC_LANGUAGE_CODE } = process.env;
let language: typeof import('./en/index.ts') | typeof import('./fr/index.ts');

switch (NEXT_PUBLIC_LANGUAGE_CODE) {
  case 'en': {
    language = await import('./en/index');
    break;
  }

  case 'fr': {
    language = await import('./fr/index');
    break;
  }

  default: {
    throw new Error(`Unsupported language: ${NEXT_PUBLIC_LANGUAGE_CODE}`);
  }
}

export const { content } = language;
```

Read the [TypeScript documentation on `const` assertions](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions) for more details on `as const`.

### Create an instance of i18n

`createI18n` takes the `content` object as an argument and returns an object with the `t` and `tt` content resolver functions as properties. You can then use those functions to look up content by its path from the root of the object.

If you pass the above content into `createI18n`, you can use the `t` and `tt` functions to retrieve the `documentTitle` as shown below.

```ts
import { createI18n } from '@next-box/i18n';
import { content } from './content.ts';

const { tt } = createI18n(content);

// The path passed to `tt` is type-checked against the object
// passed to `createI18n`.
//
// Hover over `documentTitle` or `tt` to see the inferred type
// and value preview in your IDE.
//
// This would be "This is the homepage" for the single-language example.
// For a multi-language content object, this can be a union of the
// corresponding values.
const documentTitle = tt('pages.homepage.documentTitle');

// Do something with `documentTitle`
```

The `t` function is an untyped content lookup. It takes a string and returns the value that the path resolves to in the i18n object passed into `createI18n`. If the function resolves no value, it returns `undefined`.

The `tt` function, on the other hand, is a typed content lookup. It takes a string that is type-checked against the possible paths in the i18n object passed into `createI18n`. The value that the path resolves to can be previewed through your IDE's built-in TypeScript type preview. If the function resolves no value, it throws an error.

#### Templating

The `t` and `tt` functions support content with template variables. You can define template variables in content with double curly braces around a camelCase variable name, for example `Welcome back, {{fullName}}!`.

When you want to retrieve that piece of content, provide a second argument containing the key/value pairs used to populate the template variables, as shown below.

```ts
import { createI18n } from '@next-box/i18n';

const content = {
  en: {
    greeting: 'Welcome back, {{fullName}}!',
  },
} as const;

const { tt } = createI18n(content);

const greeting = tt('en.greeting', { fullName: 'Joe Bloggs' });

console.log(greeting); // Will log 'Welcome back, Joe Bloggs!'
```

#### Error handling

The typed `tt` resolver provides compile-time type checking and runtime validation. TypeScript can prevent invalid paths from being passed to `tt`, while the runtime check provides a backstop if an invalid path is nevertheless supplied at runtime.

> The `t` function does not perform this type checking or throw when a path cannot be resolved. It is intentionally looser in terms of what a developer can enter and returns `undefined` when the requested value cannot be resolved.

### Using markdown files

For blocks of content that consist of multiple paragraphs or different types of content, it can be easier to define these in markdown files. The library supports markdown files through the `md` macro.

The `md` macro processes a markdown file at build time and produces a value that can be included in your content object.

Below is an example of a content object that includes markdown.

```ts
import { md } from '@next-box/i18n/macros' with { type: 'macro' }; // This is important!

const content = {
  en: {
    contactUs: md('./markdown/contactUs.md'),
  },
} as const;
```

> The functions exported from the `'/macros'` sub-path are intended to be imported with the `with { type: 'macro' }` import attribute when using `unplugin-macros` or a compiler/bundler that supports this macro import mechanism, such as [Bun](https://bun.sh/) or [Parcel](https://parceljs.org/).

By default, the path you pass into the `md` macro is relative to the current working directory. You can change this via the `.i18n-macro.config.json` config file. Create one in your project root and add a `markdownDir` property with a relative path from the current working directory to the directory where your markdown files live.

```json
{
  "markdownDir": "./src/content/markdown"
}
```

The `markdownDir` path supports the `NEXT_PUBLIC_LANGUAGE_CODE` template variable. This value is read from the environment when the macro is processed. You can use this if you support multiple languages.

The multi-language content directory structure must be the same for this approach to work correctly.

```json
{
  "markdownDir": "./src/content/{{NEXT_PUBLIC_LANGUAGE_CODE}}/markdown"
}
```

#### Markdown to JSX

The `md` macro is designed to be used with the `Md` markdown render component and `I18nProvider` context provider. `Md` transforms markdown into React components, while `I18nProvider` provides shared configuration such as a component mapper and `markdown-to-jsx` options to descendant `Md` components.

> Under the hood, the library uses the [`markdown-to-jsx`](https://github.com/quantizor/markdown-to-jsx) npm package to transform markdown into JSX. See the package's documentation for more information on its configuration options. The `componentMapper` prop maps to the `markdown-to-jsx` `overrides` option.

The example below illustrates how to use the `md` macro, `I18nProvider`, and `Md` component together.

```tsx
import { md } from '@next-box/i18n/macros' with { type: 'macro' };
import { I18nProvider, Md } from '@next-box/i18n';
import { componentMapper } from './componentMapper.ts';

export const Component = () => {
  return (
    <I18nProvider componentMapper={componentMapper}>
      <Md>{md('./content/markdown/contactUs.md')}</Md>
    </I18nProvider>
  );
};
```

## Changelog

Check out the [features, fixes and more](../../CHANGELOG.md) that go into each major, minor and patch version.

## License

@next-box/i18n is [MIT Licensed](LICENSE).
