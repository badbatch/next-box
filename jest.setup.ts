import '@testing-library/jest-dom/jest-globals';

// Multiple rules conflict here
// eslint-disable-next-line unicorn/no-typeof-undefined
if (typeof Reflect.get(globalThis, 'structuredClone') === 'undefined') {
  Reflect.set(globalThis, 'structuredClone', <T>(value: T): T =>
    // This is fallback for structuredClone, JSON.parse returns any type
    // eslint-disable-next-line unicorn/prefer-structured-clone,@typescript-eslint/consistent-type-assertions
    value === undefined ? value : (JSON.parse(JSON.stringify(value)) as T),
  );
}
