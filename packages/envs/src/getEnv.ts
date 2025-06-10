export const getEnv = <T extends string>(key: string): T | undefined =>
  // Want ability to return literal string type is user requires.
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  ('envs' in globalThis ? globalThis.envs[key] : undefined) as T | undefined;
