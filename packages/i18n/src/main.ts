import { type AnyRecord, type Path, createConfigReader } from 'zcb';
import { type CreateI18nResult } from '#types.ts';

export const createI18n = <U extends object>(i18n: U): CreateI18nResult<U> => {
  const reader = createConfigReader<U>(i18n);

  return {
    // @ts-expect-error intentionally ignoring the type checking here as
    // function is supposed to be untyped.
    t: (key: string, variables?: AnyRecord): string | undefined => reader.read(key, variables),
    tt: <P extends Path<U>>(path: P, variables?: AnyRecord) => {
      const result = reader.read(path, variables);

      // This can resolve to a falsy value at runtime
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (!result) {
        throw new Error(`Path "${String(path)}" did not resolve to a value`);
      }

      return result;
    },
  };
};
