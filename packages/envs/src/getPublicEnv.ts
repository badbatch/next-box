export const getPublicEnv = <T extends string>(name: string): T => {
  if (!name.startsWith('NEXT_PUBLIC_')) {
    throw new Error(
      `The name ${name} does not start with NEXT_PUBLIC_. Only public environment variables can be accessed with this function.`,
    );
  }

  // This should not have possibility of undefined for caller.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions, unicorn/prefer-global-this
  return (typeof window === 'undefined' ? process.env[name] : globalThis.env[name]) as T;
};
