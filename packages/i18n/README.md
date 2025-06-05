# @next-box/i18n

A type-safe content resolver with content path auto-complete, value preview, and markdown support.

[![npm version](https://badge.fury.io/js/%40next-box%2Fi18n.svg)](https://badge.fury.io/js/%40next-box%2Fi18n)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> To use this library you must be able/willing to define your content in typescript and markdown files.

## Installation

```shell
# terminal
npm add @next-box/i18n
```

## Usage

### Create content files

Content needs to be fed into the library's `createI18n` init function in the form of a serializable object. This can be defined in a single typescript file or multiple files with a barrel file. Each language for which you have content should be a root property on the object, i.e. ```{ en: {...}, fr: {...} }```

The function returns an object with the `t` and `tt` content resolver functions as properties. You can then use those functions to look up content by its path from the root of the object.

Below is a simplistic example of how to define a content object that would be compatible with `createI18n`.

```ts
export const content = {
  en: {
    pages: {
      homepage: {
        documentTitle: 'This is the homepage',
      },
    },
  },
} as const; // This is important!
```

Read the [typescript docs]((https://www.typescriptlang.org/docs/handbook/release-notes/typescript-3-4.html#const-assertions)) on it for more details on `as const`.

### Create an instance of the i18n

If you pass the above content into `createI18n`, you can use the `t` and `tt` functions to retrieve the `documentTitle` like in the example below.

```ts
import { createI18n } from '@next-box/i18n';
import { content } from './content.ts';

const { tt } = createI18n(content);
const documentTitle = tt('en.pages.homepage.documentTitle'); // path is type-checked against the object passed into `createI18n`
console.log(documentTitle); // Will log 'This is the homepage'
```

The `t` function is an untyped content lookup. The function takes a string and returns the value that path resolves to in the i18n object passed into `createI18n`. If the function resolves no value, then it returns undefined.

The `tt` function, on the other hand, is a typed content lookup. The function takes a string that is type-checked against all the possible paths in the i18n object passed into `createI18n`. The value that path resolves to can be previewed through IDE's inbuilt Typescript type preview. If the function resolves no value, then it throws an error.

#### Templating

The `t` and `tt` functions support content with template variables. You can define template variables in content with double curley braces either side of a camelcase variable name, i.e. `Welcome back, {{fullName}}!`.

Then, when you want to retrieve that piece of content, you do so along with a second argument of key/value pairs used to populate the template variables like in the example below.

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

There are two types of errors to help guard against mistakes in retrieving content, build-time typescript errors and runtime javascript exceptions. The former prevents a developer from entering an invalid path into the `tt` function, while the latter provides a backstop in case the initial type errors were ignored.

> There is no error handling with the `t` function. It is indented to be much looser in terms of what a developer can enter and what happens when the function cannot resolve the path; it just returns `undefined`.

### Using markdown files

For blocks of content that consist of multiple paragraphs or different types of content, it can be easier to define these in markdown files. The library supports markdown files through the `md` macro.

Macros are a mechanism for running JavaScript functions at bundle-time. The value returned from these functions are directly inlined into your bundle.

Below is an example of a content object that includes markdown.

```ts
import { md } from '@next-box/i18n/macros' with { type: 'macro' }; // This is important!

const content = {
  en: {
    contactUs: md('./src/markdown/contactUs.md'),
  },
} as const;
```

> All the functions exported from the `'/macros'` sub-path are intended to be imported with the `with { type: 'macro' }` import attribute in conjunction with the use of the `unplugin-macros` [plugin](https://github.com/unplugin/unplugin-macros) or a compiler/bundler that supports the macros import attribute such as [Bun](https://bun.sh/) or [Parcel](https://parceljs.org/).

The `md` macro is designed to be used with the `Md` markdown render component and `I18nProvider` context provider. `Md` transforms markdown into React components, while `I18nProvider` provides a way to share a component mapper and `markdown-to-jsx` options between instances of `Md`.

> Under the hood, the library uses the `markdown-to-jsx` npm package to transform markdown into JSX.

The contrived example below illustrates how to use the `md` macro, `I18nProvider`, and `Md` component together.

```tsx
import { md } from '@next-box/i18n/macros' with {type: 'macro'};
import { I18nProvider, Md } from '@next-box/i18n';
import { componentMapper } from './componentMapper.ts';

export const Component = () => {
  return (
    <I18nProvider componentMapper={componentMapper}>
      <Md>{md('content.path.to.markdown.file')}</Md>
    </I18nProvider>
  );
};
```

## Changelog

Check out the [features, fixes and more](../../CHANGELOG.md) that go into each major, minor and patch version.

## License

@next-box/i18n is [MIT Licensed](LICENSE).
