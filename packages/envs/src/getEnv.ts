export const getEnv = <T extends string>(name: string): T => {
  // Next.js does have process defined and release is not
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  const isNode = typeof process !== 'undefined' && process.release?.name === 'node';
  // This should not have possibility of undefined for caller.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return (isNode ? process.env[name] : globalThis.env[name]) as T;
};
