export const getPublicEnvs = (env: Record<string, string | undefined>) =>
  Object.entries(env).reduce<Record<string, string>>((acc, [key, value]) => {
    if (key.startsWith('NEXT_PUBLIC_') && value) {
      return {
        ...acc,
        [key]: value,
      };
    }

    return acc;
  }, {});
