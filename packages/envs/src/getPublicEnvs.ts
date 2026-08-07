export const getPublicEnvs = (
  env: Record<string, string | undefined>,
  whitelist: string[] = [],
): Record<string, string> =>
  Object.entries(env).reduce<Record<string, string>>((acc, [key, value]) => {
    if (value && (key === 'NODE_ENV' || key.startsWith('NEXT_PUBLIC_') || whitelist.includes(key))) {
      return {
        ...acc,
        [key]: value,
      };
    }

    return acc;
  }, {});
