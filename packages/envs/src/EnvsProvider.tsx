import { type ReactNode, createContext } from 'react';

export type EnvsContextData = {
  envs: Record<string, string | undefined>;
  getEnv: (name: string) => string | undefined;
};

export const EnvsContext = createContext<EnvsContextData>({
  envs: {},
  getEnv: () => '',
});

export type EnvsProviderProps = {
  children: ReactNode | ((ctx: EnvsContextData) => ReactNode | ReactNode[]);
  envs: Record<string, string | undefined>;
};

export const EnvsProvider = (props: EnvsProviderProps) => {
  const envs = { ...props.envs };
  const getEnv = (key: string) => envs[key];

  return (
    <EnvsContext.Provider value={{ envs, getEnv }}>
      {typeof props.children === 'function' ? props.children({ envs, getEnv }) : props.children}
    </EnvsContext.Provider>
  );
};
