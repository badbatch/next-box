import { type ReactNode, createContext } from 'react';
import { getPublicEnvs } from '#getPublicEnvs.ts';

export type EnvsContextData = {
  envs: Map<string, string>;
  getEnv: (name: string) => string | undefined;
};

export const EnvsContext = createContext<EnvsContextData>({
  envs: new Map(),
  getEnv: () => '',
});

export type EnvsProviderProps = {
  children: ReactNode | ((ctx: EnvsContextData) => ReactNode | ReactNode[]);
  envs: Record<string, string | undefined>;
};

export const EnvsProvider = (props: EnvsProviderProps) => {
  const envs = new Map(Object.entries(getPublicEnvs(props.envs)));
  const getEnv = (key: string) => envs.get(key);

  return (
    <EnvsContext.Provider value={{ envs, getEnv }}>
      {typeof props.children === 'function' ? props.children({ envs, getEnv }) : props.children}
    </EnvsContext.Provider>
  );
};
