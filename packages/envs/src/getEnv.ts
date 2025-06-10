// Want ability to return literal string type is user requires.
// eslint-disable-next-line @typescript-eslint/consistent-type-assertions
export const getEnv = <T extends string>(key: string): T | undefined => globalThis.envs[key] as T | undefined;
