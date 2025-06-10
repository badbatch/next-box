export const getEnv = (key: string): string | undefined => globalThis.envs[key];
