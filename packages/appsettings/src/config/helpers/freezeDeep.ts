import { isPlainObject } from 'remeda';

export const freezeDeep = <T>(value: T): T => {
  if (isPlainObject(value) && !Object.isFrozen(value)) {
    const values: unknown[] = Object.values(value);

    for (const entry of values) {
      freezeDeep(entry);
    }

    Object.freeze(value);
  }

  return value;
};
