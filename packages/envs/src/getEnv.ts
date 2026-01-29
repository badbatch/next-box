export const getEnv = <T extends string>(name: string): T => {
  // This should not have possibility of undefined for caller.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, unicorn/prefer-global-this
  return (typeof window === 'undefined' ? process.env[name] : globalThis.env[name]) as T;
};
