import { type HTMLAttributes } from 'react';
import { getPublicEnvs } from '#getPublicEnvs.ts';

export type PublicEnvVarsScriptProps = HTMLAttributes<HTMLScriptElement> & {
  whitelist: string[];
};

export const PublicEnvVarsScript = ({ whitelist, ...restProps }: PublicEnvVarsScriptProps) => {
  const envs = getPublicEnvs(process.env, whitelist);

  return (
    <script
      async
      dangerouslySetInnerHTML={{
        __html: `
          (function(){
            globalThis.env = ${JSON.stringify(envs)};
          })();
        `,
      }}
      defer
      {...restProps}
    />
  );
};
