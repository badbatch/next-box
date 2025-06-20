import { type AnyRecord, type ConfigReader } from 'zcb';

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

export type MacrosConfig = {
  // mardownDir should be a relative path from the current working
  // directory. The relative path supports a template variable NEXT_PUBLIC_LANGUAGE_CODE,
  // which is populated by setting an environment variable with the same name.
  // You can use this if you support multiple languages like in the example below.
  // `./content/{{NEXT_PUBLIC_LANGUAGE_CODE}}/markdown`
  markdownDir?: string;
};
