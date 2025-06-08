import { type ComponentType } from 'react';
import { type AnyRecord, type ConfigReader } from 'zcb';

// Need to keep as generic as possible.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ComponentMapper = Record<string, ComponentType<any>>;

export type CreateI18nResult<U extends object> = {
  // Untyped content lookup. Function takes a string and returns the
  // value that path resolves in the i18n object passed into createI18n.
  // If the function resolves no value, then it returns undefined.
  t: (key: string, variables?: AnyRecord) => string | undefined;
  // A typed content lookup. Function takes a string that is type-checked
  // against all the possible paths in the i18n object passed into
  // createI18n. The value that path resolves to can be previewed through
  // IDE's inbuilt Typescript type preview. If the function resolves no
  // value, then it throws an error.
  tt: ConfigReader<U>['read'];
};
