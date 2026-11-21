import { type AnyRecord, createConfigReader } from 'zcb';
import { type CreateI18nResult } from '#types.ts';

export const createI18n = <U extends object>(i18n: U): CreateI18nResult<U> => {
  const reader = createConfigReader<U>(i18n);

  const tt: CreateI18nResult<U>['tt'] = (path, ...variables) => {
    const result = reader.read(path, ...variables);

    if (result === undefined) {
      throw new Error(`Path "${String(path)}" did not resolve to a value`);
    }

    return result;
  };

  return {
    // @ts-expect-error intentionally ignoring the type checking here as
    // function is supposed to be untyped.
    t: (key: string, variables?: AnyRecord): string | undefined => reader.read(key, variables),
    tt,
  };
};
