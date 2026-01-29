export const getPublicEnvs = (env: Record<string, string | undefined>, whitelist: string[] = []) =>
  Object.entries(env).reduce<Record<string, string>>((acc, [key, value]) => {
    if ((key === 'NODE_ENV' || key.startsWith('NEXT_PUBLIC_') || whitelist.includes(key)) && value) {
      return {
        ...acc,
        [key]: value,
      };
    }

    return acc;
  }, {});
